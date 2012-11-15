class DiabetesController < ApplicationController
  def time_series
    @glucose_sensor_data_count = GlucoseSensorData.count
  end

  def heat_map
  end
end
