class AddGlucoseIndex < ActiveRecord::Migration
  def up
    add_index(:glucose_sensor_data, [:timestamp, :day, :glucose])
  end

  def down
    remove_index(:glucose_sensor_data, [:timestamp, :day, :glucose])
  end
end
