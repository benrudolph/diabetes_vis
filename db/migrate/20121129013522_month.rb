class Month < ActiveRecord::Migration
  def up
    change_table :glucose_sensor_data do |t|
      t.integer :month
    end
    GlucoseSensorData.reset_column_information
    GlucoseSensorData.find_each do |data|
      data.month = data.timestamp.strftime("%m").to_i
      data.save(:validate => false)
    end
  end

  def down
    remove_column :glucose_sensor_data, :month
  end
end
