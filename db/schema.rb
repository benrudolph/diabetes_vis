# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121129020833) do

  create_table "bg_receiveds", :force => true do |t|
    t.datetime "timestamp"
    t.integer  "bg_reading"
  end

  create_table "bolus_normals", :force => true do |t|
    t.datetime "timestamp"
    t.string   "type"
    t.float    "selected"
    t.float    "delivered"
  end

  create_table "bolus_wizard_bolus_estimates", :force => true do |t|
    t.datetime "timestamp"
    t.float    "estimate"
    t.integer  "target_high"
    t.integer  "target_low"
    t.float    "carb_ratio"
    t.integer  "insulin_sensitivity"
    t.integer  "carb_input"
    t.integer  "bg_input"
    t.float    "correction_estimate"
    t.float    "food_estimate"
    t.float    "active_estimate"
  end

  create_table "current_carb_ratios", :force => true do |t|
    t.datetime "timestamp"
    t.integer  "index"
    t.string   "units"
    t.float    "amount"
    t.integer  "start_time"
  end

  create_table "glucose_sensor_data", :force => true do |t|
    t.integer  "glucose"
    t.float    "isig"
    t.datetime "timestamp"
    t.integer  "time"
    t.integer  "day"
    t.integer  "month"
  end

  add_index "glucose_sensor_data", ["month", "glucose"], :name => "index_glucose_sensor_data_on_month_and_glucose"
  add_index "glucose_sensor_data", ["timestamp", "day", "glucose"], :name => "index_glucose_sensor_data_on_timestamp_and_day_and_glucose"
  add_index "glucose_sensor_data", ["timestamp", "time", "day"], :name => "index_glucose_sensor_data_on_timestamp_and_time_and_day"
  add_index "glucose_sensor_data", ["timestamp"], :name => "index_glucose_sensor_data_on_timestamp"

  create_table "rewinds", :force => true do |t|
    t.datetime "timestamp"
    t.string   "action"
  end

end
