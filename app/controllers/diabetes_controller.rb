class DiabetesController < ApplicationController
  EPSILON_MINUTES = 60
  DAYS_OF_WEEK = %w[sunday monday tuesday wednesday thursday friday
saturday]

  def dashboard
  end

  def time_series
    @glucose_sensor_data_count = GlucoseSensorData.count
  end

  def day_series
    @date_extent = [
      GlucoseSensorData.minimum(:timestamp).strftime("%Y-%m-%d"),
      GlucoseSensorData.maximum(:timestamp).strftime("%Y-%m-%d")
    ]
  end

  def average_day(time, range)
    day_of_week = time.wday

    #return []

    averages = []

    (0..((60 * 24) - 1)).step(EPSILON_MINUTES) do |n|
      minutes_start = (n % 60).to_s.rjust(2, "0")
      hours_start = (n / 60).to_s.rjust(2, "0")

      # Since between operator is inclusive, we make it 1 second less than the next value
      minutes_end = ((n + EPSILON_MINUTES - 1) % 60).to_s.rjust(2, "0")
      hours_end = ((n + EPSILON_MINUTES - 1) / 60).to_s.rjust(2, "0")

      data = GlucoseSensorData.where("time between #{hours_start}#{minutes_start}00 AND #{hours_end}#{minutes_end}59 and day = #{day_of_week}").between(range[:begin], range[:end], :field => :timestamp)

      #unless range.empty?
      #  data
      #end

      timestamp = Time.utc(time.year, time.month, time.day, hours_start, minutes_start)
      datum = {
        "timestamp" => timestamp.to_s,
        "glucose" => data.average(:glucose)
      }

      averages << datum

    end

    return averages

  end

  def day_averages
    limit = (params[:limit] || 1).to_i

    year, month, day = params[:day].split("-")
    time = Time.utc(year, month, day)

    max = GlucoseSensorData.maximum(:timestamp)
    range = {}
    unless range == "all"
      range = { :begin => max - limit.months, :end => max }
    end


    averages = average_day(time, range)

    render :json => averages.to_json
  end

  # Gets data for a week. Send in a day in this format: %Y-%m-%d, this function will get the nearest monday
  # through sunday. For example, hand in 12/12/12 which happens to be a wednesday. This will get days Monday,
  # 12/10/12 through Sunday 12/16/12
  def week
    require "ruby-debug"
    year, month, day = params[:date].split("-").map(&:to_i)
    interval = (params[:interval] || 10).to_i

    time = Time.utc(year, month, day)

    # Calculate monday from given date
    date = time - (time.wday.days - 1.days)

    week_data = []

    DAYS_OF_WEEK.each do |day|
      interval_data = Hash.new { |h, k| h[k] = [] }
      date += 1.days

      data = GlucoseSensorData.by_day(date, :field => :timestamp)


      data.each do |datum|
        minutes = datum.timestamp.min + (datum.timestamp.hour * 60)
        # At first seems like a no op but this actually buckets minutes into intervals
        bucket = (minutes / interval) * interval

        interval_data[bucket] << datum
      end

      interval_data.each_pair do |bucket, datums|
        datum = {}

        unless datums
          next
        end

        # Averages glucose values if there are more than one datum for that bucket
        datum[:glucose] = datums.inject(0.0) { |sum, d| sum + d.glucose } / datums.size

        datum[:time] = bucket
        datum[:day] = day
        week_data << datum
      end
    end

    render :json => { :data => week_data, :interval => interval }
  end

  # Gets data for given day format will be %Y-%m-%d
  def day
    year, month, day = params[:date].split("-")
    time = Time.utc(year, month, day)
    day_data = GlucoseSensorData.by_day(time, :field => :timestamp)

    #@day_data.map do |datum|
    #  datum[:glucose_scaled] = (Math.log(datum[:glucose]) - Math.log(120)) ** 2
    #end

    max = GlucoseSensorData.maximum(:timestamp)
    limit = (params[:limit] || 1).to_i
    range = {}
    unless range == "all"
      range = { :begin => max - limit.months, :end => max }
    end

    averages = average_day(time, range)

    response = {
      "averages" => averages,
      "day_data" => day_data
    }

    render :json => response.to_json
  end

  def heat_map
  end

  def _get_monthly_glucose_ratios(year, global_average=0)
    monthly_ratio_list = []
    (1..12).each do |month|
      dict = {}
      if global_average != 0
        query = GlucoseSensorData.where("month = #{month}")
      else
        query = GlucoseSensorData.by_month(month, :year => year, :field => :timestamp)
      end
      total = query.count
      dict[:low] = (total != 0) ? query.where("glucose < 80").count.to_f / total : 0
      dict[:optimal] = (total != 0) ? query.where("glucose >= 80 and glucose < 180").count.to_f / total : 0
      dict[:high] = (total != 0) ? query.where("glucose >= 180").count.to_f / total : 0
      dict[:date] = Date.new(2012, month).to_s
      monthly_ratio_list << dict
    end
    return monthly_ratio_list
  end

  def get_monthly_glucose_ratios
    year, month, day = params[:date].split("-").map(&:to_i)
    global_average = params[:global_average].to_i
    data = {}
    data[:data] = _get_monthly_glucose_ratios(year)
    if global_average != 0
      data[:averages] = _get_monthly_glucose_ratios(year, global_average)
    end
    render :json => data
  end

  def get_all_daily_ratios
    data = {}
    data[:data] = _get_all_daily_ratios()
    data[:averages] = _get_all_daily_ratios(true)
    render :json => data
  end

  def _get_all_daily_ratios(compute_averages=false)
    first = GlucoseSensorData.reorder(:timestamp).first
    last = GlucoseSensorData.reorder(:timestamp).last
    boundary = last.timestamp.year + 1
    date_obj = Date.new(first.timestamp.year, 1)
    daily_ratio_list = []

    while (date_obj.next_day.year != boundary)
      dict = {}
      if compute_averages
        query = GlucoseSensorData.between(first.timestamp, last.timestamp, :field => :timestamp).where("day = #{date_obj.wday}")
      else
        query = GlucoseSensorData.by_day(date_obj, :field => :timestamp)
      end
      total = query.count
      dict[:low] = (total != 0) ? query.where("glucose < 80").count.to_f / total : 0
      dict[:optimal] = (total != 0) ? query.where("glucose >= 80 and glucose < 180").count.to_f / total : 0
      dict[:high] = (total != 0) ? query.where("glucose >= 180").count.to_f / total : 0
      dict[:date] = date_obj.to_s
      daily_ratio_list << dict
      date_obj = date_obj.next_day
    end
    return daily_ratio_list
  end

  def _get_daily_glucose_ratios(year, month, week, n_prior_weeks=0)
    date_obj = Date.new(year, month).beginning_of_week + week.weeks
    daily_ratio_list = []
    (0..6).each do |offset|
      dict = {}
      if n_prior_weeks > 0
        query = GlucoseSensorData.between(date_obj - n_prior_weeks.weeks, date_obj - 1.day, :field => :timestamp).where("day = #{date_obj.wday}")
      else
        query = GlucoseSensorData.by_day(date_obj, :field => :timestamp)
      end
      total = query.count
      dict[:low] = (total != 0) ? query.where("glucose < 80").count.to_f / total : 0
      dict[:optimal] = (total != 0) ? query.where("glucose >= 80 and glucose < 180").count.to_f / total : 0
      dict[:high] = (total != 0) ? query.where("glucose >= 180").count.to_f / total : 0
      dict[:date] = date_obj.to_s
      daily_ratio_list << dict
      date_obj += 1.day
    end
    return daily_ratio_list
  end

  def get_daily_glucose_ratios
    year, month, day = params[:date].split("-").map(&:to_i)
    #year = params[:year].to_i
    #month = params[:month].to_i + 1 # adjust for 0 index
    #week = params[:week].to_i
    week = 1
    #n_prior_weeks = params[:n_prior_weeks].to_i
    n_prior_weeks = 1
    data = {}
    data[:data] = _get_daily_glucose_ratios(year, month, week)
    if n_prior_weeks != 0
      data[:averages] = _get_daily_glucose_ratios(year, month, week, n_prior_weeks)
    end
    render :json => data
  end

  def brushing
  end

  def _get_month_data(month, year, increments)
    interval = (1.day / increments).seconds
    date_obj = Date.new(year, month)
    data = []
    while (date_obj.month == month)
      interval_start = date_obj
      cur_dict = {}
      cur_dict[:date] = date_obj
      cur_dict[:glucose] = []
      (1..increments).each do |i|
        interval_end = interval_start + interval
        cur_dict[:glucose] << GlucoseSensorData.between(interval_start, interval_end, :field => :timestamp).average(:glucose)
        interval_start = interval_end
      end
      data << cur_dict
      date_obj += 1.day
    end
    return data
  end

  def get_month_data
    year = params[:year].to_i
    month = params[:month].to_i
    increments = params[:increments].to_i
    data = _get_month_data(month, year, increments)
    render :json => data
  end
end
