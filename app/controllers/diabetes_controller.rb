class DiabetesController < ApplicationController
  def time_series
    @glucose_sensor_data_count = GlucoseSensorData.count
  end

  def heat_map
  end

  def _get_daily_glucose_ratios(year, month, week)
    date_obj = Date.new(year, month).beginning_of_month + week.weeks
    if date_obj.month != month
      return nil
    end
    daily_ratio_list = []
    (0..6).each do |offset|
      dict = {}
      date_obj += 1.day
      query = GlucoseSensorData.by_day(date_obj, :field => :timestamp)
      total = query.count
      dict[:low] = (total != 0) ? query.where("glucose < 80").count.to_f / total : 0
      dict[:optimal] = (total != 0) ? query.where("glucose >= 80 and glucose < 180").count.to_f / total : 0
      dict[:high] = (total != 0) ? query.where("glucose >= 180").count.to_f / total : 0
      dict[:date] = date_obj.to_s
      daily_ratio_list << dict
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
