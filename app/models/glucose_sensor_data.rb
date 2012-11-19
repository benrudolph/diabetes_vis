class GlucoseSensorData < ActiveRecord::Base
  attr_accessible :id, :timestamp, :glucose, :isig, :glucose_scaled
end
