class CreateBolusNormals < ActiveRecord::Migration
  def up
    create_table :bolus_normals do |t|
      t.integer :id
      t.timestamp :timestamp
      t.string :type
      t.float :selected
      t.float :delivered
    end
  end

  def down
    drop_table :bolus_normals
  end
end
