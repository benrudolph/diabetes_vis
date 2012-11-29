class MonthIndex < ActiveRecord::Migration
  def up
    add_index(:glucose_sensor_data, [:month, :glucose])
  end

  def down
    remove_index(:glucose_sensor_data, [:month, :glucose])
  end
end
