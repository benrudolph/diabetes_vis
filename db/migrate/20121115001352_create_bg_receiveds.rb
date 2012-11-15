class CreateBgReceiveds < ActiveRecord::Migration
  def up
    create_table :bg_receiveds do |t|
      t.integer :id
      t.timestamp :timestamp
      t.integer :bg_reading
    end
  end

  def down
    drop_table :bg_receiveds
  end
end
