class BolusWizardBolusEstimate < ActiveRecord::Base
  attr_accessible :timestamp, :estimate, :target_high, :target_low, :carb_ratio, :insulin_sensitivity,
      :carb_input, :bg_input, :correction_estimate, :food_estimate, :active_estimate
end
