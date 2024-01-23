import { ApolloClient } from 'apollo-client';
import { Formik } from 'formik';
import { useCallback, useEffect, useRef } from 'react';

import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {bool, object, string} from 'yup';

import {BillableMetricForm} from '../components/BillableMetricForm/BillableMetricForm';
import {Accordion, Alert, Button, Skeleton, Typography} from '../components/designSystem';
import {useBillableMetricQuery, useUpdateBillableMetricMutation} from '../generated/graphql';

import { useCreateEditBillableMetric} from '~/hooks/useCreateEditBillableMetric';   
import { card,PageHeader, theme } from '~/styles';

gql`
    fragment BillableMetricFormValues on BillableMetric {
        id
        name
        description
        unit
        unitPrice
        unitType
        unitTypeOther
        unitTypeOtherDescription
    }
`

const CreateBillableMetric = () => {
    const { translate } = useInternationalization()
    const { isEdition, loading, billableMetric, errorCode, onSave } = useCreateEditBillableMetric()
    const warningDirtyAttributesDialogRef = useRef<WarningDialogRef>(null)
    const warningGroupEditDialogRef = useRef<EditBillableMetricGroupDialogRef>(null)
    let navigate = useNavigate()
    const formikProps = useFormik<CreateBillableMetricInput>({
      initialValues: {
        name: billableMetric?.name || '',
        code: billableMetric?.code || '',
        description: billableMetric?.description || '',
        group: JSON.stringify(billableMetric?.group || undefined, null, 2),
        // @ts-ignore
        aggregationType: billableMetric?.aggregationType || '',
        fieldName: billableMetric?.fieldName || undefined,
        recurring: billableMetric?.recurring || false,
      },
      validationSchema: object().shape({
        name: string().required(''),
        code: string().required(''),
        aggregationType: string().required(''),
        fieldName: string().when('aggregationType', {
          is: (aggregationType: AggregationTypeEnum) =>
            !!aggregationType && aggregationType !== AggregationTypeEnum.CountAgg,
          then: (schema) => schema.required(''),
        }),
        recurring: bool().required(''),
      }),
      enableReinitialize: true,
      validateOnMount: true,
      onSubmit: onSave,
    })
    const canBeEdited = !billableMetric?.subscriptionsCount && !billableMetric?.plansCount
  
    useEffect(() => {
      if (
        formikProps.values.aggregationType === AggregationTypeEnum.CountAgg &&
        !!formikProps.values.fieldName
      ) {
        formikProps.setFieldValue('fieldName', undefined)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formikProps.values.aggregationType, formikProps.values.fieldName])
  
    useEffect(() => {
      if (errorCode === FORM_ERRORS_ENUM.existingCode) {
        formikProps.setFieldError('code', 'text_632a2d437e341dcc76817556')
        const rootElement = document.getElementById('root')
  
        if (!rootElement) return
        rootElement.scrollTo({ top: 0 })
      }
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorCode])
  
    const handleUpdate = useCallback(
      (name: string, value: unknown) => {
        // Reset aggregationType if the recurring changes and is not compatible
        if (
          name === 'recurring' &&
          (formikProps.values.aggregationType === AggregationTypeEnum.CountAgg ||
            formikProps.values.aggregationType === AggregationTypeEnum.LatestAgg ||
            formikProps.values.aggregationType === AggregationTypeEnum.MaxAgg)
        ) {
          formikProps.setFieldValue('aggregationType', '')
        }
  
        formikProps.setFieldValue(name, value)
      },
  
      [formikProps],
    )
  
    return (
      <div>
        <PageHeader>
          <Typography variant="bodyHl" color="textSecondary" noWrap>
            {translate(isEdition ? 'text_62582fb4675ece01137a7e44' : 'text_623b42ff8ee4e000ba87d0ae')}
          </Typography>
          <Button
            variant="quaternary"
            icon="close"
            onClick={() =>
              formikProps.dirty
                ? warningDirtyAttributesDialogRef.current?.openDialog()
                : navigate(BILLABLE_METRICS_ROUTE)
            }
          />
        </PageHeader>
  
        <Content>
          <Main>
            <div>
              {loading ? (
  
                    <ComboBoxField
                      sortValues={false}
                      formikProps={formikProps}
                      name="aggregationType"
                      disabled={isEdition && !canBeEdited}
                      label={
                        <InlineComboboxLabel>
                          <Typography variant="captionHl" color="textSecondary">
                            {translate('text_623b42ff8ee4e000ba87d0ce')}
                          </Typography>
                          {formikProps.values.aggregationType ===
                            AggregationTypeEnum.WeightedSumAgg && <BetaChip size="xsmall" />}
                        </InlineComboboxLabel>
                      }
                      infoText={translate('text_624d9adba93343010cd14c56')}
                      placeholder={translate('text_623b42ff8ee4e000ba87d0d0')}
                      virtualized={false}
                      data={[
                        ...(!formikProps.values?.recurring
                          ? [
                              {
                                label: translate('text_623c4a8c599213014cacc9de'),
                                value: AggregationTypeEnum.CountAgg,
                              },
                            ]
                          : []),
  
                        {
                          label: translate('text_62694d9181be8d00a33f20f0'),
                          value: AggregationTypeEnum.UniqueCountAgg,
                        },
                        ...(!formikProps.values?.recurring
                          ? [
                              {
                                label: translate('text_64f8823d75521b6faaee8549'),
                                value: AggregationTypeEnum.LatestAgg,
                              },
                              {
                                label: translate('text_62694d9181be8d00a33f20f8'),
                                value: AggregationTypeEnum.MaxAgg,
                              },
                            ]
                          : []),
  
                        {
                          label: translate('text_62694d9181be8d00a33f2100'),
                          value: AggregationTypeEnum.SumAgg,
                        },
                        {
                          labelNode: (
                            <InlineComboboxLabel>
                              <Typography variant="body" color="grey700">
                                {translate('text_650062226a33c46e82050486')}
                              </Typography>
                              <BetaChip size="xsmall" />
                            </InlineComboboxLabel>
                          ),
  
                          label: translate('text_650062226a33c46e82050486'),
                          value: AggregationTypeEnum.WeightedSumAgg,
                        },
                      ]}
                      helperText={
                        formikProps.values?.aggregationType === AggregationTypeEnum.CountAgg
                          ? translate('text_6241cc759211e600ea57f4f1')
                          : formikProps.values?.aggregationType === AggregationTypeEnum.UniqueCountAgg
                            ? translate('text_62694d9181be8d00a33f20f6')
                            : formikProps.values?.aggregationType === AggregationTypeEnum.LatestAgg
                              ? translate('text_64f8823d75521b6faaee854b')
                              : formikProps.values?.aggregationType === AggregationTypeEnum.MaxAgg
                                ? translate('text_62694d9181be8d00a33f20f2')
                                : formikProps.values?.aggregationType === AggregationTypeEnum.SumAgg
                                  ? translate('text_62694d9181be8d00a33f20ec')
                                  : formikProps.values?.aggregationType ===
                                      AggregationTypeEnum.WeightedSumAgg
                                    ? translate('text_650062226a33c46e82050488')
                                    : undefined
                      }
                    />
  
                    {!!formikProps.values?.aggregationType &&
                      formikProps.values?.aggregationType !== AggregationTypeEnum.CountAgg && (
                        <TextInputField
                          name="fieldName"
                          disabled={isEdition && !canBeEdited}
                          label={translate('text_62694d9181be8d00a33f20fe')}
                          placeholder={translate('text_62694d9181be8d00a33f2105')}
                          formikProps={formikProps}
                        />
                      )}
  
                    {formikProps.values?.aggregationType === AggregationTypeEnum.WeightedSumAgg && (
                      <Alert type="info">{translate('text_650062226a33c46e8205048e')}</Alert>
                    )}
                  </Card>
  
                  <Accordion
                    size="large"
                    summary={
                      <Typography variant="subhead" color="grey700">
                        {translate('text_633d410368cc8282af23212b')}
                      </Typography>
                    }
                  >
                    <JsonEditorField
                      name="group"
                      label={translate('text_633d410368cc8282af232131')}
                      helperText={
                        <Typography
                          variant="caption"
                          color="grey600"
                          html={translate('text_633d410368cc8282af232143')}
                        />
                      }
                      placeholder={translate('text_633d410368cc8282af23213d')}
                      customInvalidError={translate('text_633b622c201ca8b521bcad59')}
                      formikProps={formikProps}
                    />
  
                    {errorCode === FORM_ERRORS_ENUM.invalidGroupValue && (
                      <GroupAlert type="danger">
                        <Typography
                          color="inherit"
                          html={translate('text_633d410368cc8282af23214e')}
                        />
                      </GroupAlert>
                    )}
                  </Accordion>
  
                  <ButtonContainer>
                    <Button
                      disabled={!formikProps.isValid || (isEdition && !formikProps.dirty)}
                      fullWidth
                      data-test="submit"
                      size="large"
                      onClick={async () => {
                        if (
                          (!!billableMetric?.group || !!formikProps.values.group) &&
                          (!!billableMetric?.subscriptionsCount || !!billableMetric?.plansCount) &&
                          isEdition
                        ) {
                          const groupChangeLevel = determineGroupDiffLevel(
                            billableMetric?.group,
                            formikProps?.values?.group,
                          )
  
                          if (groupChangeLevel === GroupLevelEnum.StructuralChange) {
                            warningGroupEditDialogRef.current?.openDialog({
                              mode: WarningDialogMode.danger,
                              plansCount: billableMetric?.plansCount,
                              subscriptionsCount: billableMetric?.subscriptionsCount,
                              onContinue: async () => {
                                await formikProps.submitForm()
                              },
                            })
                            return
                          } else if (groupChangeLevel === GroupLevelEnum.AddOrRemove) {
                            warningGroupEditDialogRef.current?.openDialog({
                              mode: WarningDialogMode.info,
                              plansCount: billableMetric?.plansCount,
                              subscriptionsCount: billableMetric?.subscriptionsCount,
                              onContinue: async () => {
                                await formikProps.submitForm()
                              },
                            })
                            return
                          }
                        }
                        await formikProps.submitForm()
                      }}
                    >
                      {translate(
                        isEdition ? 'text_62582fb4675ece01137a7e6c' : 'text_623b42ff8ee4e000ba87d0d4',
                      )}
                    </Button>
                  </ButtonContainer>
                </>
              )}
            </div>
          </Main>
    )
  }
  
  const GroupAlert = styled(Alert)`
    margin-top: ${theme.spacing(6)};
  `
  
  const InlineComboboxLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing(2)};
  `
  
  export default CreateBillableMetric