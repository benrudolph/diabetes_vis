class CreateCurrentCarbRatios < ActiveRecord::Migration
  def up
    create_table :current_carb_ratios do |t|
      t.datetime :timestamp
      t.integer :index
      t.string :units
      t.float :amount
      t.integer :start_time
    end
  end

  def down
    drop_table :current_carb_ratios
  end
end
