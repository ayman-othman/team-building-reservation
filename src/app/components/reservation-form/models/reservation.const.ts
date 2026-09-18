export const TRANSPORTATION_TYPE = {
  BUS: 'Bus',
  PRIVATE_CAR: 'PrivateCar',
} as const;

export const RESERVATION_FORM_FIELDS = {
  STAFF_ID: 'staffId',
  NAME: 'name',
  DIGITAL_TEAM: 'team',
  TRANSPORTATION_TYPE: 'transportationType',
  WANT_SINGLE_ROOM: 'wantSingleRoom',
  BUS_RESERVATION: 'busReservation',
  NATIONAL_ID_MODE: 'nationalIdMode',
  NOTE: 'note',
};

export const DIGITAL_TEAMS = [
  'Frontend',
  'Backend',
  'IOS',
  'Android',
  'Digital Operation',
  'DevOps',
  'Digital Architects',
];
