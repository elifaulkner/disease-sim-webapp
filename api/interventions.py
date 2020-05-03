
def intervention_sign(i):
    sign = -1
    if i['type'] in ['confirmed_case_percentage']:
        sign = 1
    return sign 

def effectiveness_to_scale(i):
    return 1+intervention_sign(i)*float(dict['effectiveness'])

def scale_to_effectiveness(i):
    return (i.scale-1)*intervention_sign(i)
