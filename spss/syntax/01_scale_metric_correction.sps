* Encoding: UTF-8.
*****************************************************************************.
* PLC Programme Evaluation - Scale Metric Correction and Range Verification  *.
*                                                                           *.
* Run this on PLC_responses_SPSS_coded.sav.                                 *.
*                                                                           *.
* PURPOSE                                                                   *.
*   1. Put every 5-point Likert-type item on a common 1-5 metric.           *.
*   2. Document possible range against observed range for every item.       *.
*                                                                           *.
* WHAT IS CORRECTED                                                         *.
*   E1-E10 (challenge severity) were captured 0-4. They are rescaled to      *.
*   1-5 as E1_5 ... E10_5. The originals are kept so nothing is lost.       *.
*                                                                           *.
* WHAT IS NOT CORRECTED, AND WHY                                            *.
*   The 54 agreement items (B, C, D4-D13, F, G) are ALREADY coded 1-5 with   *.
*   correct value labels. Where FREQUENCIES reports Minimum = 2 or 3, that   *.
*   is the OBSERVED minimum - no respondent chose the lower category. It is  *.
*   a finding about the sample, not a coding fault. Do not recode it.        *.
*****************************************************************************.

*---------------------------------------------------------------------------.
* STEP 1. Confirm no value falls outside its defined scale range.            .
* Every one of these should show Minimum >= 1 and Maximum <= 5.              .
*---------------------------------------------------------------------------.
DESCRIPTIVES VARIABLES=B1 TO B10 C1 TO C12 D4 TO D13 F1 TO F10 G1 TO G7
  /STATISTICS=MEAN STDDEV MIN MAX.

*---------------------------------------------------------------------------.
* STEP 2. Rescale the severity items from 0-4 to 1-5.                        .
*---------------------------------------------------------------------------.
COMPUTE E1_5  = E1  + 1.
COMPUTE E2_5  = E2  + 1.
COMPUTE E3_5  = E3  + 1.
COMPUTE E4_5  = E4  + 1.
COMPUTE E5_5  = E5  + 1.
COMPUTE E6_5  = E6  + 1.
COMPUTE E7_5  = E7  + 1.
COMPUTE E8_5  = E8  + 1.
COMPUTE E9_5  = E9  + 1.
COMPUTE E10_5 = E10 + 1.
EXECUTE.

VARIABLE LABELS
  E1_5  'Inadequate time within the school timetable [rescaled 1-5]'
  E2_5  'Heavy teaching workload [rescaled 1-5]'
  E3_5  'Distance and transport to the session venue [rescaled 1-5]'
  E4_5  'Personal cost of attending sessions [rescaled 1-5]'
  E5_5  'Inadequate teaching and learning materials for PLC activities [rescaled 1-5]'
  E6_5  'Limited preparedness of those who facilitate sessions [rescaled 1-5]'
  E7_5  'Irregular supervision and monitoring [rescaled 1-5]'
  E8_5  'Low interest or motivation among teachers [rescaled 1-5]'
  E9_5  'Poor internet connectivity or portal access [rescaled 1-5]'
  E10_5 'Limited support from school leadership [rescaled 1-5]'.

VALUE LABELS E1_5 E2_5 E3_5 E4_5 E5_5 E6_5 E7_5 E8_5 E9_5 E10_5
  1 'Not a challenge'
  2 'Minor challenge'
  3 'Moderate challenge'
  4 'Serious challenge'
  5 'Very serious challenge'.

VARIABLE LEVEL E1_5 E2_5 E3_5 E4_5 E5_5 E6_5 E7_5 E8_5 E9_5 E10_5 (ORDINAL).
EXECUTE.

*---------------------------------------------------------------------------.
* STEP 3. Verify the rescaling. Minimum must now be >= 1, Maximum <= 5.      .
* The mean rises by exactly 1.00; the standard deviation is unchanged.       .
*---------------------------------------------------------------------------.
DESCRIPTIVES VARIABLES=E1 TO E10 E1_5 E2_5 E3_5 E4_5 E5_5 E6_5 E7_5 E8_5 E9_5 E10_5
  /STATISTICS=MEAN STDDEV MIN MAX.

*---------------------------------------------------------------------------.
* STEP 4. Out-of-range audit. Counts any value outside 1-5 on the Likert     .
* items. A correct dataset returns 0 for every case.                         .
*---------------------------------------------------------------------------.
COUNT OutOfRange = B1 TO B10 C1 TO C12 D4 TO D13 F1 TO F10 G1 TO G7
                   E1_5 E2_5 E3_5 E4_5 E5_5 E6_5 E7_5 E8_5 E9_5 E10_5 (LOWEST THRU 0.999, 5.001 THRU HIGHEST).
VARIABLE LABELS OutOfRange 'Number of Likert responses outside the 1-5 range'.
EXECUTE.

FREQUENCIES VARIABLES=OutOfRange.

*---------------------------------------------------------------------------.
* STEP 5. Full category frequencies for the items whose observed minimum     .
* is above 1. This is the evidence that the floor was simply never used.     .
*---------------------------------------------------------------------------.
FREQUENCIES VARIABLES=B8 B9 B10 C5 D4 D6 F7 F9 G3 G4 G7
  /ORDER=ANALYSIS.

*---------------------------------------------------------------------------.
* STEP 6. Reverse-scored items - already correct as 6 minus the original.    .
* This re-derives them and confirms they agree with the stored versions.     .
*---------------------------------------------------------------------------.
COMPUTE chk_B6  = (6 - B6)  - B6_R.
COMPUTE chk_C4  = (6 - C4)  - C4_R.
COMPUTE chk_D12 = (6 - D12) - D12_R.
COMPUTE chk_F10 = (6 - F10) - F10_R.
COMPUTE chk_G5  = (6 - G5)  - G5_R.
EXECUTE.

DESCRIPTIVES VARIABLES=chk_B6 chk_C4 chk_D12 chk_F10 chk_G5
  /STATISTICS=MIN MAX.
* All minima and maxima must be 0. If so, delete the check variables: .
DELETE VARIABLES chk_B6 chk_C4 chk_D12 chk_F10 chk_G5.

*---------------------------------------------------------------------------.
* STEP 7. Save the corrected working file under a NEW name.                  .
* Never overwrite the original raw file.                                     .
*---------------------------------------------------------------------------.
SAVE OUTFILE='PLC_responses_SPSS_coded_v2.sav'
  /COMPRESSED.

*****************************************************************************.
* NOTE ON A8, D1 and D3                                                     *.
* These are count and frequency bands where 0 carries real meaning:         *.
* "None", "Rarely or never". They are left 0-based on purpose. They are not *.
* attitude items and should not be forced onto a 1-5 metric.                *.
*                                                                           *.
* NOTE ON A9                                                                *.
* A9 is dichotomous, 0 = No and 1 = Yes. That is standard dummy coding and  *.
* is correct as it stands.                                                  *.
*****************************************************************************.
