import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ThemeColorDescriptor } from 'next/dist/lib/metadata/types/metadata-types';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { ToastContainer } from '~/components/ToastContainer';
import {ErrorBoundary} from '~/components/ErrorBoundary';
import { RouteWrapper } from '~/components/RouteWrapper';
import { AuthContext } from '~/contexts/AuthContext';
import { initializeApolloClient, initializeTranslation } from '~/core/ApolloClient';
import { useShortcuts } from '~/hooks/useShortcuts';
import { theme } from '~/styles'
import { inputGlobalStyle } from '~/styles/global';

const App = () => {
    const [client, setClient] = useState<ApolloClient<any>>();
    const debug = useRef(false);

    useEffect(() => {
        initializeTranslation();
        setClient(initializeApolloClient());
    }, []);

    return(
        <BrowserRouter basename={process.env.BASE_URL}>
            <ApolloProvider client={client}>
                <ThemeProvider theme={theme}>
                    {inputGlobalStyle}
                    <ErrorBoundary>
                        <AuthContext.Provider value={{}}>
                            <Switch>
                                <RouteWrapper path="/" component={Home} />
                            </Switch>
                        </AuthContext.Provider>
                    </ErrorBoundary>
                </ThemeProvider>
            </ApolloProvider>
        </BrowserRouter>
    )
}

export default App;
