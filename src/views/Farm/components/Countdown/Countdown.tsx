import React, { useEffect, useState } from 'react'
import moment from 'moment';

interface CountdownProps {
  percentageToDistribute: number,
  percentageDistributed?: number
  timestampStartDistribution: number,
  timestampEndDistribution: number
}

const Countdown: React.FC<CountdownProps> = ({
  percentageToDistribute,
  timestampStartDistribution,
  timestampEndDistribution,
  percentageDistributed
}) => {
  const [time, setTime] = useState(0)

  // Reload every .5 second
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setTime(Date.now());
    }, 500)
    return () => clearInterval(refreshInterval)
  }, [setTime])

  const renderCountdown = (timestamp: any) => {
    const remainingDays = moment.unix(timestamp).utc().diff(moment(), 'days')
    const remainingHours = moment.unix(timestamp).utc().diff(moment(), 'hours') - (remainingDays * 24);
    const remainingMinutes = moment.unix(timestamp).utc().diff(moment(), 'minutes') - (remainingDays * 24 * 60) - (remainingHours * 60);
    const remainingSeconds = moment.unix(timestamp).utc().diff(moment(), 'seconds') - (remainingDays * 24 * 60 * 60) - (remainingHours * 60 * 60) - (remainingMinutes * 60);

    const paddedHours = remainingHours < 10 ? `0${remainingHours}` : remainingHours
    const paddedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes
    const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds

    return (
      <span>
        {remainingDays}:{paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    )
  }

  const isInFuture = moment.unix(timestampStartDistribution).utc() > moment();
  const hasEnded = moment.unix(timestampEndDistribution).utc() <= moment();

  return (
    <div>
      <h2 className="
        normal-case
        mt-2
        mb-4
        text-yellow-theme
        text-shadow-theme
      ">
        {hasEnded && <div style={{color: hasEnded ? 'transparent' : ''}}>
          {percentageToDistribute}% ENDED
        </div>}
        {isInFuture && <div>
          {percentageToDistribute}%
          STARTS IN {renderCountdown(timestampStartDistribution)}
        </div>}
        {(! isInFuture && ! hasEnded) && <div>
          {percentageToDistribute}% ENDS IN {renderCountdown(timestampEndDistribution)}
        </div>}
      </h2>
    </div>
  )
}

export default Countdown
