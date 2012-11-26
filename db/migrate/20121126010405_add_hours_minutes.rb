class AddHoursMinutes < ActiveRecord::Migration
  def up
    change_table :glucose_sensor_data do |t|
      t.integer :time
      t.integer :day
    end
    GlucoseSensorData.reset_column_information
    GlucoseSensorData.find_each do |data|
      data.time = data.timestamp.strftime("%H%M%S").to_i
      data.day = data.timestamp.strftime("%w").to_i
      data.save(:validate => false)
    end
  end

  def down
    remove_column :glucose_sensor_data, :time
    remove_column :glucose_sensor_data, :day
  end
end
