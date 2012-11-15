class CreateGlucoseSensorData < ActiveRecord::Migration
  def up
    create_table :glucose_sensor_data do |t|
      t.integer :id
      t.integer :glucose
      t.float :isig
      t.timestamp :timestamp
    end
  end

  def down
    drop_table :glucose_sensor_data
  end
end
