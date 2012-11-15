import csv
from datetime import datetime
separator = ', '

def get_raw_values(row):
    raw_values = row['Raw-Values']
    return dict(map(lambda el: el.split('='), raw_values.split(', ')))

def init_bulk_loader(f, class_name):
    f.write("class Load%s < ActiveRecord::Migration\n" % class_name)
    f.write("\tdef up\n")
    f.write("\t\tdown\n")

def teardown_bulk_loader(f, class_name):
    f.write("\tend\n\n\tdef down\n\t\t%s.delete_all\n\tend\nend" % class_name)
    f.close()

def write_line(f, class_name, args):
    args = separator.join([":%s => %s" % (k, v) if v else ":%s => nil" % k for (k, v) in args.iteritems()])
    f.write("\t\tobj = %s.new(%s)\n" % (class_name, args))
    f.write("\t\tobj.save(:validate => false)\n")

with open('data.csv', 'rb') as f:
    Rewind = open('data/Rewind.rb', 'w')
    init_bulk_loader(Rewind, 'Rewind')
    BolusWizardBolusEstimate = open('data/BolusWizardBolusEstimate.rb', 'w')
    init_bulk_loader(BolusWizardBolusEstimate, 'BolusWizardBolusEstimate')
    GlucoseSensorData = open('data/GlucoseSensorData.rb', 'w')
    init_bulk_loader(GlucoseSensorData, 'GlucoseSensorData')
    BgReceived = open('data/BgReceived.rb', 'w')
    init_bulk_loader(BgReceived, 'BgReceived')
    BolusNormal = open('data/BolusNormal.rb', 'w')
    init_bulk_loader(BolusNormal, 'BolusNormal')
    CurrentCarbRatio = open('data/CurrentCarbRatio.rb', 'w')
    init_bulk_loader(CurrentCarbRatio, 'CurrentCarbRatio')
    reader = csv.reader(f, delimiter=',')
    header = reader.next()
    for row in reader:
        row = dict(zip(header, row))
        index = row['Index']
        timestamp = row['Timestamp']
        timestamp = datetime.strptime(timestamp,"%m/%d/%Y %H:%M")
        timestamp = timestamp.strftime("%Y-%m-%d %H:%M:%S")
        row_type = row['Raw-Type']
        default = {"timestamp": '"%s"' % timestamp}
        if row['BG Reading (mg/dL)']:
            default['bg_reading'] = row['BG Reading (mg/dL)']
            write_line(BgReceived, 'BgReceived', default)
        if row_type == 'GlucoseSensorData':
            default['glucose'] = row['Sensor Glucose (mg/dL)']
            default['isig'] = row['ISIG Value']
            write_line(GlucoseSensorData, row_type, default)
        if row_type == 'CurrentCarbRatio':
            raw = get_raw_values(row)
            default['index'] = raw.get('INDEX')
            default['units'] = '"%s"' % raw.get('UNITS')
            default['amount'] = raw.get('AMOUNT')
            default['start_time'] = raw.get('START_TIME')
            write_line(CurrentCarbRatio, row_type, default)
        if row_type == 'Rewind' or row_type == 'ChangeSuspendEnable':
            default['action'] = '"%s"' % (row['Rewind'] or row['Suspend'])
            write_line(Rewind, 'Rewind',  default)
        if row_type == 'BolusNormal':
            default['type'] = '"%s"' % (row['Bolus Type'])
            default['selected'] = row['Bolus Volume Selected (U)']
            default['delivered'] = row['Bolus Volume Delivered (U)']
            write_line(BolusNormal, row_type, default)
        if row_type == 'BolusWizardBolusEstimate':
            default['estimate'] = row['BWZ Estimate (U)']
            default['target_high'] = row['BWZ Target High BG (mg/dL)']
            default['target_low'] = row['BWZ Target Low BG (mg/dL)']
            default['carb_ratio'] = row['BWZ Carb Ratio (grams)']
            default['insulin_sensitivity'] = row['BWZ Insulin Sensitivity (mg/dL)']
            default['carb_input'] = row['BWZ Carb Input (grams)']
            default['bg_input'] = row['BWZ BG Input (mg/dL)']
            default['correction_estimate'] = row['BWZ Correction Estimate (U)']
            default['food_estimate'] = row['BWZ Food Estimate (U)']
            default['active_estimate'] = row['BWZ Active Insulin (U)']
            write_line(BolusWizardBolusEstimate, row_type, default)
    teardown_bulk_loader(Rewind, 'Rewind')
    teardown_bulk_loader(BolusWizardBolusEstimate, 'BolusWizardBolusEstimate')
    teardown_bulk_loader(GlucoseSensorData, 'GlucoseSensorData')
    teardown_bulk_loader(BgReceived, 'BgReceived')
    teardown_bulk_loader(BolusNormal, 'BolusNormal')
    teardown_bulk_loader(CurrentCarbRatio, 'CurrentCarbRatio')
