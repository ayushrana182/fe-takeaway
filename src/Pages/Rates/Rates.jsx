import { useState } from 'react';
import DropDown from '../../Components/DropDown';
import ProgressBar from '../../Components/ProgressBar';
import Loader from '../../Components/Loader';
import Input from '../../Components/Input';

import { useAnimationFrame } from '../../Hooks/useAnimationFrame';
import { ReactComponent as Transfer } from '../../Icons/Transfer.svg';

import classes from './Rates.module.css';

import CountryData from '../../Libs/Countries.json';
import countryToCurrency from '../../Libs/CountryCurrency.json';

let countries = CountryData.CountryCodes;
const MARKUP_PERCENT = 0.005; // 0.5% markup

const Rates = () => {
    const [fromCurrency, setFromCurrency] = useState('AU');
    const [toCurrency, setToCurrency] = useState('US');
    
    const [exchangeRate, setExchangeRate] = useState(0.7456);
    const [amount, setAmount] = useState('');
    const [progression, setProgression] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const Flag = ({ code }) => (
        <img alt={code || ''} src={`/img/flags/${code || ''}.svg`} width="20px" className={classes.flag} />
    );

    const fetchData = async () => {
        if (!loading) {
            setLoading(true);
            setError('');
            const sellCurrency = countryToCurrency[fromCurrency];
            const buyCurrency = countryToCurrency[toCurrency];
            // console.log('Fetching rate', sellCurrency, buyCurrency);
        try {
            const res = await fetch(
                `https://rates.staging.api.paytron.com/rate/public?sellCurrency=${sellCurrency}&buyCurrency=${buyCurrency}`
            );
            
            const data = await res.json();
            
            if (!res.ok) {
                setError(data?.detail || 'Failed to fetch rate');
                return;
            }

            if (data?.retailRate) {
                setExchangeRate(parseFloat(data.retailRate));
            }
        } catch (err) {
            console.error('Failed to fetch rate:', err);
        } finally {
            setLoading(false);
        }
        }
    };

    // Demo progress bar moving :)
    useAnimationFrame(!loading, (deltaTime) => {
        setProgression((prevState) => {
            if (prevState > 0.998) {
                fetchData();
                return 0;
            }
            return (prevState + deltaTime * 0.0001) % 1;
        });
    });


    const parsedAmount = parseFloat(amount);
    const isValidAmount = !isNaN(parsedAmount);

    const trueAmount = isValidAmount ? parsedAmount * exchangeRate : 0;
    const markedUpRate = exchangeRate - exchangeRate * MARKUP_PERCENT;
    const markedUpAmount = isValidAmount ? parsedAmount * markedUpRate : 0;

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                <div className={classes.heading}>Currency Conversion</div>
                {/* amount input field */}
                <div className={classes.inputWrapper}>
                 <Input
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type='number'
                    />
                </div>
                {/* currency selectors */}
                <div className={classes.rowWrapper}>
                    <div>
                        <DropDown
                            leftIcon={<Flag code={fromCurrency} />}
                            label={'From'}
                            selected={countryToCurrency[fromCurrency]}
                            options={countries.map(({ code }) => ({
                                option: countryToCurrency[code],
                                key: code,
                                icon: <Flag code={code} />,
                            }))}
                            setSelected={(key) => {
                                setFromCurrency(key);
                            }}
                            style={{ marginRight: '20px' }}
                        />
                    </div>

                    <div className={classes.exchangeWrapper}>
                        <div className={classes.transferIcon}>
                            <Transfer height={'25px'} />
                        </div>

                        <div className={classes.rate}>{exchangeRate}</div>
                    </div>

                    <div>
                        <DropDown
                            leftIcon={<Flag code={toCurrency} />}
                            label={'To'}
                            selected={countryToCurrency[toCurrency]}
                            options={countries.map(({ code }) => ({
                                option: countryToCurrency[code],
                                key: code,
                                icon: <Flag code={code} />,
                            }))}
                            setSelected={(key) => {
                                setToCurrency(key);
                            }}
                            style={{ marginLeft: '20px' }}
                        />
                    </div>
                </div>
                 {/* Calculated conversion outputs */}
                <div className={classes.conversionOutput}>
                    {isValidAmount && !error && (
                        <>
                            <div>True Amount: {trueAmount.toFixed(2)} {countryToCurrency[toCurrency]}</div>
                            <div>OFX Marked Up Amount: {markedUpAmount.toFixed(2)} {countryToCurrency[toCurrency]}</div>
                        </>
                    )}
                </div>

                {error && (
                    <div className={classes.errorMessage}>
                        {error}
                    </div>
                )}

                <ProgressBar
                    progress={progression}
                    animationClass={loading ? classes.slow : ''}
                    style={{ marginTop: '20px' }}
                />

                {loading && (
                    <div className={classes.loaderWrapper}>
                        <Loader width={'25px'} height={'25px'} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rates;
