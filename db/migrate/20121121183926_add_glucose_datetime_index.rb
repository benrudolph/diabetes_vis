class AddGlucoseDatetimeIndex < ActiveRecord::Migration
  def up
    add_index(:glucose_sensor_data, :timestamp)
  end

  def down
    remove_index(:glucose_sensor_data, :column => :timestamp)
  end
end
