class GlucoseSensorData < ActiveRecord::Base
  attr_accessible :id, :timestamp, :glucose, :isig
end
