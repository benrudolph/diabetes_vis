class DiabetesController < ApplicationController
  EPSILON_MINUTES = 2

  def time_series
    @glucose_sensor_data_count = GlucoseSensorData.count
  end

  def day_series
    @date_extent = [
      GlucoseSensorData.minimum(:timestamp).strftime("%Y-%m-%d"),
      GlucoseSensorData.maximum(:timestamp).strftime("%Y-%m-%d")
    ]
  end

  def average_day

  end

  # Gets data for given day format will be %Y-%m-%d
  def day
    year, month, day = params[:day].split("-")
    @day_data = GlucoseSensorData.by_day(Time.utc(year, month, day), :field => :timestamp)

    #@day_data.map do |datum|
    #  datum[:glucose_scaled] = (Math.log(datum[:glucose]) - Math.log(120)) ** 2
    #end

    render :json => @day_data.to_json
  end

  def heat_map
  end

  def _get_daily_glucose_ratios(year, month, week)
    date_obj = Date.new(year, month).beginning_of_week + week.weeks
    if date_obj.month != month
      return nil
    end
    daily_ratio_list = []
    (0..6).each do |offset|
      dict = {}
      query = GlucoseSensorData.by_day(date_obj, :field => :timestamp)
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
    year = params[:year].to_i
    month = params[:month].to_i + 1 # adjust for 0 index
    week = params[:week].to_i
    daily_ratio_list = _get_daily_glucose_ratios(year, month, week)
    render :json => daily_ratio_list
  end
end
