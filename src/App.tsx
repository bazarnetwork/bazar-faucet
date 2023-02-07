import * as React from 'react';
import './App.css';
import { cryptography, transactions } from '@liskhq/lisk-client';
import { getClient } from './getClient';

const accounts = {
    "genesis": {
        "passphrase": "path satisfy finish modify pride still broken pretty adapt bulb raven salute"
    }
};

interface FaucetConfig {
	amount: string;
	tokenPrefix: string;
	logoURL?: string;
}

const defaultFaucetConfig: FaucetConfig = {
	amount: '100',
	tokenPrefix: 'lsk',
};

export const getConfig = async () => {
	if (process.env.NODE_ENV === 'development') {
		return defaultFaucetConfig;
	}

	const apiResponse = await fetch('/api/config');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const result: FaucetConfig = await apiResponse.json();

	return result;
};

declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		grecaptcha: any;
	}
}

const WarningIcon = () => <span>&#xE8B2;</span>;


const App: React.FC = () => {
	const [input, updateInput] = React.useState('');
	const [errorMsg, updateErrorMsg] = React.useState('');
	const [config, setConfig] = React.useState<FaucetConfig>(defaultFaucetConfig);
    const [state, updateState] = React.useState({
        address: '',
        amount: '',
        transaction: {},
        response: {}
    });
	React.useEffect(() => {
		const initConfig = async () => {
			const fetchedConfig = await getConfig();
			setConfig({ ...fetchedConfig });
		};
		initConfig().catch(console.error);
	}, []);

	const onChange = (val: string) => {
		updateInput(val);
		if (val === '') {
			updateErrorMsg('');
		}
	};

	const onSubmit = async () => {
        const client = await getClient();        
        console.log("input:", input);
        const address = cryptography.getAddressFromBase32Address(input);
        const tx = await client.transaction.create({
            moduleID: 2,
            assetID: 0,
            fee: BigInt(transactions.convertLSKToBeddows('0.01')),
            asset: {
                amount: BigInt(transactions.convertLSKToBeddows(config.amount)),
                recipientAddress: address,
                data: 'BZR is sending Token for free'
            },
        }, accounts.genesis.passphrase);

        const response = await client.transaction.send(tx);
        console.log("ejecutado");
        updateState({
            transaction: client.transaction.toJSON(tx),
            address: input,
            amount: config.amount,
            response: response
            });
        
	};
	return (
		<main className="container">
            <article className="grid">
                <div>
                <hgroup>
                    <h1>Bazar Network Faucet</h1>	
                    <h2>Testnet BZR covers transactions for testing purposes</h2>
                    </hgroup>
                        <input	
                            id='formAccount'
                            name='formAccount'					
                            value={input}
                            placeholder='Input your Bazar Network address'
                            onChange={e => onChange(e.target.value)}
                        />
                        {errorMsg ? <WarningIcon /> : <span />}
                        {errorMsg ? <span>{errorMsg}</span> : <span />}
                            
                        <button onClick={onSubmit}>Receive 100 BZR</button>
                        
                        <div> { state.address ? (
                            <pre>Completed, Address: {state.address} Token amount: {state.amount} BZR Token amount: {state.amount} BZR</pre>
                            
                        ): (<pre></pre>
                        )
                        }
                        </div>				
                    </div>
            </article>
		</main>
	);
};

export default App;