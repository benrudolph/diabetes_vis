class BolusNormal < ActiveRecord::Base
  attr_accessible :id, :timestamp, :type, :selected, :delivered
end
