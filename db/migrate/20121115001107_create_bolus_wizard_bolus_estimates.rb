class CreateBolusWizardBolusEstimates < ActiveRecord::Migration
  def up
    create_table :bolus_wizard_bolus_estimates do |t|
      t.integer :id
      t.timestamp :timestamp
      t.float :estimate
      t.integer :target_high
      t.integer :target_low
      t.float :carb_ratio
      t.integer :insulin_sensitivity
      t.integer :carb_input
      t.integer :bg_input
      t.float :correction_estimate
      t.float :food_estimate
      t.float :active_estimate

    end
  end

  def down
    drop_table :bolus_wizard_bolus_estimates
  end
end
