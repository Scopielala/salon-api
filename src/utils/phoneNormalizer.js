import {parsePhoneNumberFromString} from 'libphonenumber-js/max';

// This function receives phone number and returns the normalized phone number in E.164 format
// The frontend should send the phone number starting with the country code, e.g. +1 for US, +44 for UK, etc.
export function normalizePhoneNumber(phoneNumber) {
    const normalizedNumber = parsePhoneNumberFromString(phoneNumber);

    if (!normalizedNumber || !normalizedNumber.isValid()) {
        return null;
    }

    return normalizedNumber.number;
}