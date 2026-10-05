import {parsePhoneNumberFromString} from 'libphonenumber-js';

// This function receives phone number and returns the normalized phone number in E.164 format

export function normalizePhoneNumber(phoneNumber) {
    const normalizedNumber = parsePhoneNumberFromString(phoneNumber);

    if (!normalizedNumber || !normalizedNumber.isValid()) {
        return null;
    }

    return parsed.number;
}