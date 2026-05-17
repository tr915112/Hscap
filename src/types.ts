/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RegistrationData {
  id: string; // Internal ID for keys
  applicationNumber: string;
  registerNumber: string;
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  sex: string;
  aadharNumber: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  religion: string;
  caste: string;
  categoryName: string;
  oec: string;
  communicationAddress: string;
  permanentAddress: string;
}

export const EXTRACTION_FIELDS = [
  { key: 'applicationNumber', label: 'Application Number' },
  { key: 'registerNumber', label: 'Register Number' },
  { key: 'name', label: 'Name' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'sex', label: 'Sex' },
  { key: 'aadharNumber', label: 'Aadhar Number' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'guardianName', label: 'Guardian Name' },
  { key: 'religion', label: 'Religion' },
  { key: 'caste', label: 'Caste' },
  { key: 'categoryName', label: 'Category Name' },
  { key: 'oec', label: 'OEC' },
  { key: 'communicationAddress', label: 'Communication Address' },
  { key: 'permanentAddress', label: 'Permanent Address' },
] as const;
