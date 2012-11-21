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
end
