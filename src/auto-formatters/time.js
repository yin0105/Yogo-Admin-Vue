export default function (value) {

    if (value === '') return ''
    value = value.replace('.', ':').replace(' ', ':')
    value = value.replace(/[^\d\:]/g, '')

    const colonPos = value.indexOf(':')

    let hours, minutes

    if (colonPos > -1) {

        if (value.indexOf(':', colonPos + 1) > -1) {
            return ''
        }

        hours = /^(\d+)\:/.exec(value)
        if (hours) {
            hours = Math.min(parseInt(hours[1]), 23)
            hours = _.padStart(hours, 2, '0')
        } else {
            hours = '00'
        }
        minutes = /\:(\d+)$/.exec(value)
        if (minutes) {
            minutes = Math.min(minutes[1], 59)
            minutes = _.padStart(minutes, 2, '0')
        } else {
            minutes = '00'
        }
        return hours + ':' + minutes
    }
    value = _.truncate(value, {length: 4})

    switch (value.length) {
        case 4:
            hours = value.substr(0, 2)
            minutes = value.substr(2, 2)
            break;
        case 3:
            hours = value.substr(0, 1)
            minutes = value.substr(1, 2)
            break;
        case 2:
        case 1:
            hours = value
            minutes = 0
            break;
    }
    hours = _.padStart(Math.min(hours, 23), 2, '0')
    minutes = _.padStart(Math.min(minutes, 59), 2, '0')
    return hours + ':' + minutes
}
