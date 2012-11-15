import csv
from datetime import datetime
separator = ','

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

def write_line(f, class_name, arr):
    arguments = separator.join(arr)
    f.write("\t\tobj = %s.new(%s)\n" % (class_name, arguments))
    f.write("\t\tobj.save(:validate => false)\n")

with open('data.csv', 'rb') as f:
    Rewind = open('data/Rewind.rb', 'w')
    init_bulk_loader(Rewind, 'Rewind')
    BolusWizardBolusEstimate = open('data/BolusWizardBolusEstimate.rb', 'w')
    init_bulk_loader(BolusWizardBolusEstimate, 'BolusWizardBolusEstimate')
    GlucoseSensorData = open('data/GlucoseSensorData.rb', 'w')
    init_bulk_loader(GlucoseSensorData, 'GlucoseSensorData')
    BGReceived = open('data/BGReceived.rb', 'w')
    init_bulk_loader(BGReceived, 'BGReceived')
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
        default = [index, '"%s"' % timestamp]
        if row_type == 'BGReceived':
            write_line(BGReceived, row_type, default + [row['BG Reading (mg/dL)']])
        if row_type == 'GlucoseSensorData':
            write_line(GlucoseSensorData, row_type, default + [row['Sensor Glucose (mg/dL)'], row['ISIG Value']])
        if row_type == 'CurrentCarbRatio':
            raw = get_raw_values(row)
            write_line(CurrentCarbRatio, row_type, default + [raw.get('INDEX'), raw.get('START_TIME'), raw.get('AMOUNT'), '"%s"' % raw.get('UNITS')])
        if row_type == 'Rewind' or row_type == 'ChangeSuspendEnable':
            write_line(Rewind, row_type, default + ['"%s"' % (row['Rewind'] or row['Suspend'])])
        if row_type == 'BolusNormal':
            write_line(BolusNormal, row_type, default + ['"%s"' % (row['Bolus Type']), row['Bolus Volume Selected (U)'], row['Bolus Volume Delivered (U)']])
        if row_type == 'BolusWizardBolusEstimate':
            write_line(BolusWizardBolusEstimate, row_type, default + [row['BWZ Estimate (U)'], row['BWZ Target High BG (mg/dL)'], row['BWZ Target Low BG (mg/dL)'], row['BWZ Carb Ratio (grams)'], row['BWZ Insulin Sensitivity (mg/dL)'], row['BWZ Carb Input (grams)'], row['BWZ BG Input (mg/dL)'], row['BWZ Correction Estimate (U)'], row['BWZ Food Estimate (U)'], row['BWZ Active Insulin (U)']])
    teardown_bulk_loader(Rewind, 'Rewind')
    teardown_bulk_loader(BolusWizardBolusEstimate, 'BolusWizardBolusEstimate')
    teardown_bulk_loader(GlucoseSensorData, 'GlucoseSensorData')
    teardown_bulk_loader(BGReceived, 'BGReceived')
    teardown_bulk_loader(BolusNormal, 'BolusNormal')
    teardown_bulk_loader(CurrentCarbRatio, 'CurrentCarbRatio')
