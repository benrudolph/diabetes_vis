import csv
separator = ','

def get_raw_values(row):
    raw_values = row['Raw-Values']
    return dict(map(lambda el: el.split('='), raw_values.split(', ')))

def write_line(f, arr):
    f.write(separator.join(arr) + "\n")

with open('data.csv', 'rb') as f:
    reader = csv.reader(f, delimiter=',')
    rewind = open('data/rewind.dat', 'w')
    meal_data = open('data/meal.dat', 'w')
    glucose_sensor_data = open('data/glucose_sensor_data.dat', 'w')
    finger_sticks = open('data/finger_sticks.dat', 'w')
    bolus_type = open('data/bolus_type.dat', 'w')
    carb_ratio_change = open('data/carb_ratio_change.dat', 'w')
    count = 0
    header = reader.next()
    for row in reader:
        row = dict(zip(header, row))
        index = row['Index']
        timestamp = row['Timestamp']
        row_type = row['Raw-Type']
        default = [index, timestamp]
        if row['BG Reading (mg/dL)']:
            write_line(finger_sticks, default + [row['BG Reading (mg/dL)']])
        if row_type == 'GlucoseSensorData':
            write_line(glucose_sensor_data, default + [row['Sensor Glucose (mg/dL)'], row['ISIG Value']])
        if row_type == 'CurrentCarbRatio':
            raw = get_raw_values(row)
            write_line(carb_ratio_change, default + [raw.get('INDEX'), raw.get('START_TIME'), raw.get('AMOUNT'), raw.get('UNITS')])
        if row_type == 'Rewind':
            write_line(rewind, default + [row['Rewind'] or row['Suspend']])
        if row_type == 'BolusNormal':
            write_line(bolus_type, default + [row['Bolus Type'], row['Bolus Volume Selected (U)'], row['Bolus Volume Delivered (U)']])
        if row_type == 'BolusWizardBolusEstimate':
            write_line(meal_data, default + [row['BWZ Estimate (U)'], row['BWZ Target High BG (mg/dL)'], row['BWZ Target Low BG (mg/dL)'], row['BWZ Carb Ratio (grams)'], row['BWZ Insulin Sensitivity (mg/dL)'], row['BWZ Carb Input (grams)'], row['BWZ BG Input (mg/dL)'], row['BWZ Correction Estimate (U)'], row['BWZ Food Estimate (U)'], row['BWZ Active Insulin (U)']])
