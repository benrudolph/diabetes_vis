class AddHoursDaysIndex < ActiveRecord::Migration
  def up
    add_index(:glucose_sensor_data, [:timestamp, :time, :day])
  end

  def down
    remove_index(:glucose_sensor_data, [:timestamp, :time, :day])
  end
end
