import { gql } from '@apollo/client';
import { Stack } from '@mui/material';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from 'styled-components';

import {
    Avatar,
    Button,
    ButtonLink,
    Chip,
    Icon,
    Popper,
    Skeleton,
    Tooltip,
    typography,
} from '~/components/designSystem';
import {
    useGetStripeIntegrationQuery,
    useUpdateStripeIntegrationMutation,
} from '~/generated/graphql';
import { useInternationalization } from '~/hooks/core/useInternationalization';
import { MenuPopper, NAV_HEIGHT, PageHeader, PopperOpener, theme } from '~/styles';

const PROVIDER_CONNECTION_LIMIT = 2;

gql`
    fragment StripeIntegrationDetails on StripeIntegration {
        id
        name
        provider
        connected
        createdAt
        updatedAt
    }

    query GetStripeIntegration($id: String!) {
        stripeIntegration(id: $id) {
            ...StripeIntegrationDetails
        }
    }
${MenuPopper.fragments.menuPopper}
${PageHeader.fragments.pageHeader}
`
const StripeIntegrationDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useInternationalization();
    const { data, loading } = useGetStripeIntegrationQuery({
        variables: {
            id,
        },
    });
    const [updateStripeIntegration] = useUpdateStripeIntegrationMutation();
    const popperRef = useRef<HTMLDivElement>(null);

    const handleConnect = async () => {
        const { data } = await updateStripeIntegration({
            variables: {
                id,
                input: {
                    connected: true,
                },
            },
        });

        if (data?.updateStripeIntegration) {
            window.location.href = data.updateStripeIntegration.url;
        }
    };

    const handleDisconnect = async () => {
        await updateStripeIntegration({
            variables: {
                id,
                input: {
                    connected: false,
                },
            },
        });
    };

    const handleDelete = async () => {
        await updateStripeIntegration({
            variables: {
                id,
                input: {
                    deleted: true,
                },
            },
        });

        navigate('/settings/integrations');
    };

    const handleEdit = () => {
        navigate(`/settings/integrations/${id}/edit`);
    };

    const handlePopperOpen = () => {
        if (popperRef.current) {
            popperRef.current.click();
        }
    };

    const handlePopperClose = () => {
        if (popperRef.current) {
            popperRef.current.click();
        }
    };

    const handlePopperToggle = () => {
        if (popperRef.current) {
            popperRef.current.click();
        }
    };

    const handlePopperDelete = () => {
        handlePopperClose();
        handleDelete();
    };

    const handlePopperEdit = () => {
        handlePopperClose();
        handleEdit();
    };

    const handlePopperConnect = () => {
        handlePopperClose();
        handleConnect();
    };

    const handlePopperDisconnect = () => {
        handlePopperClose();
        handleDisconnect();
    };

    const handlePopperOpenChange = (open: boolean) => {
        if (open) {
            handlePopperOpen();
        } else {
            handlePopperClose();
        }
    };

    const HeaderBlock = styled.div `
        display: flex;
        align-items: center;
        justify-content: space-between;
    `

    const Title = styled(typography.H1) `
        height: ${NAV_HEIGHT}px;
        width: 100%;
        display: flex;
    `


}

export default StripeIntegrationDetails;