import * as React from 'react';
import './App.css';
import { cryptography, transactions } from '@liskhq/lisk-client';
import { getClient } from './getClient';

const accounts = {
    "genesis": {
        "passphrase": ""
    }
};

interface FaucetConfig {
	amount: string;
	applicationUrl: string;
	tokenPrefix: string;
	logoURL?: string;
}

const defaultFaucetConfig: FaucetConfig = {
	amount: '100',
	applicationUrl: 'ws://localhost:8080/ws',
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
        getClient().then(async (client) => {
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
            updateState({
                transaction: client.transaction.toJSON(tx),
                address: input,
                amount: config.amount,
                response: response
            });
        })
	
	};
	return (
		<div>
            <h2>Faucet - Bazar Network</h2>
			
				<div className="flex flex-col items-center mt-16">
					<h1 className="text-4xl text-center">All tokens are for testing purposes only</h1>
					<h2>
						Please enter your address to receive {config.amount}{' '}
						BZR tokens for free
					</h2>
					<div>
						<div>
							<input								
								value={input}
								onChange={e => onChange(e.target.value)}
							/>
							{errorMsg ? <WarningIcon /> : <span />}
							{errorMsg ? <span>{errorMsg}</span> : <span />}
						</div>
						<button className="bg-black text-white p-2.5 w-fit mt-9 " onClick={onSubmit}>
							Receive
						</button>
					</div>
                    <div> { state.address ? (
                        <pre>Completed, Address: {state.address} Token amount: {state.amount} BZR Token amount: {state.amount} BZR</pre>
                        
                    ): (<pre></pre>
                       )
                    }
                    </div>				
				</div>
		</div>
	);
};

export default App;