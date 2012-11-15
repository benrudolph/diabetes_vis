class CreateRewinds < ActiveRecord::Migration
  def up
    create_table :rewinds do |t|
      t.integer :id
      t.timestamp :timestamp
      t.string :action
    end
  end

  def down
    drop_table :rewinds
  end
end
