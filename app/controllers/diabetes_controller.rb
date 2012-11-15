class DiabetesController < ApplicationController
  def time_series
    @glucose_sensor_data = GlucoseSensorData.all
  end

  def heat_map
  end
end
