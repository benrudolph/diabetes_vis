ENV['RAILS_ENV'] = "development"
require File.expand_path(File.dirname(__FILE__) + "/../config/environment")

def averages(range)
  dates = []
  GlucoseSensorData.all.each do |datum|
    if datum.timestamp.to_date.cwday == 1
      dates << datum.timestamp.to_date
    end
  end
  puts dates.length
end

averages(1)
