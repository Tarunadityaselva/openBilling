import { gql } from '@apollo/client'
import { useEffect, useRef } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { Button, InfiniteScroll, NavigationTab, Typography } from '~/components/designSystem'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import {
  UpdateInvoicePaymentStatusDialog,
  UpdateInvoicePaymentStatusDialogRef,
} from '~/components/invoices/EditInvoicePaymentStatusDialog'
import {
  FinalizeInvoiceDialog,
  FinalizeInvoiceDialogRef,
} from '~/components/invoices/FinalizeInvoiceDialog'
import {
  InvoiceListItem,
  InvoiceListItemContextEnum,
  InvoiceListItemGridTemplate,
  InvoiceListItemSkeleton,
} from '~/components/invoices/InvoiceListItem'
import { VoidInvoiceDialog, VoidInvoiceDialogRef } from '~/components/invoices/VoidInvoiceDialog'
import { SearchInput } from '~/components/SearchInput'
import { addToast, hasDefinedGQLError } from '~/core/apolloClient'
import {
  CUSTOMER_INVOICE_DETAILS_ROUTE,
  INVOICE_SETTINGS_ROUTE,
  INVOICES_ROUTE,
  INVOICES_TAB_ROUTE,
} from '~/core/router'
import {
  InvoiceListItemFragmentDoc,
  InvoicePaymentStatusTypeEnum,
  InvoiceStatusTypeEnum,
  LagoApiError,
  useInvoicesListLazyQuery,
  useRetryAllInvoicePaymentsMutation,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { useListKeysNavigation } from '~/hooks/ui/useListKeyNavigation'
import { useDebouncedSearch } from '~/hooks/useDebouncedSearch'
import { CustomerInvoiceDetailsTabsOptionsEnum } from '~/layouts/CustomerInvoiceDetails'
import EmptyImage from '~/public/images/maneki/empty.svg'
import ErrorImage from '~/public/images/maneki/error.svg'
import { ListContainer, ListHeader, NAV_HEIGHT, PageHeader, theme } from '~/styles'

gql`
  query invoicesList(
    $limit: Int
    $page: Int
    $status: InvoiceStatusTypeEnum
    $paymentStatus: [InvoicePaymentStatusTypeEnum!]
    $searchTerm: String
  ) {
    invoices(
      limit: $limit
      page: $page
      status: $status
      paymentStatus: $paymentStatus
      searchTerm: $searchTerm
    ) {
      metadata {
        currentPage
        totalPages
        totalCount
      }
      collection {
        id
        ...InvoiceListItem
      }
    }
  }

  mutation retryAllInvoicePayments($input: RetryAllInvoicePaymentsInput!) {
    retryAllInvoicePayments(input: $input) {
      collection {
        id
      }
    }
  }

  ${InvoiceListItemFragmentDoc}
`