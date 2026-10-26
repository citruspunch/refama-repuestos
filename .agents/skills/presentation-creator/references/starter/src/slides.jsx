import React, { useMemo } from "react"
import { Big, Facts, Head, M, Rise, Slider, Tex } from "./ui"
import { useClock, useCueState, usePresentation } from "./PresentationContext"
import { ResponseComparison } from "./Charts"
import { LiveTrace } from "./Live"
import { DURATION, responseAt, sampleResponse } from "./model"

function Title() {
  const { title } = usePresentation()
  return <div className="slide cover">
    <Rise className="kicker">Analytical teaching example</Rise>
    <Rise><h1>{title}</h1></Rise>
    <Rise className="cover-summary">How a time constant changes the response to a unit step.</Rise>
    <Rise className="cover-equation"><Tex>{String.raw`\tau\dot y + y = u`}</Tex></Rise>
  </div>
}

function Response() {
  const { guided, cue } = usePresentation()
  const [tau, setTau] = useCueState("tau", 1)
  const rows = useMemo(() => sampleResponse({ tau }), [tau])
  const time = useClock({ duration: DURATION, running: !guided || cue.values.run, resetKey: tau })
  const output = responseAt(time, tau)
  return <div className="slide">
    <Head />
    <div className="split l60">
      <Rise className="panel chart-card live-chart">
        <div className="chart-head"><h3>Unit-step output</h3><span className="chart-meta">Analytical model · dimensionless</span></div>
        <LiveTrace rows={rows} time={time} />
        <div className="readouts">
          <div><span>Elapsed time</span><b data-testid="clock">{time.toFixed(2)} s</b></div>
          <div><span>Output y(t)</span><b data-testid="output">{output.toFixed(3)}</b></div>
        </div>
      </Rise>
      <div className="stack">
        <Rise className="panel pad"><Slider label="Time constant" display={`${tau.toFixed(1)} s`} min={0.5} max={2} step={0.1} value={tau} onChange={setTau} /></Rise>
        <Rise className="equation"><Tex block>{String.raw`y(t) = 1 - e^{-t/\tau}`}</Tex></Rise>
        <Facts items={[
          { text: <>The input changes from zero to one at <M>t = 0</M>. The output starts at zero.</> },
          { icon: "timer", text: <>A larger <M>\tau</M> gives a slower response, with the same equilibrium <M>y_\infty = 1</M>.</> },
          { text: <>The trace stops at {DURATION} s. Its last sample is not the equilibrium.</> },
        ]} />
      </div>
    </div>
  </div>
}

function Comparison() {
  return <div className="slide">
    <Head />
    <div className="split l60">
      <Rise><ResponseComparison /></Rise>
      <div className="stack">
        <div className="bignums"><Big color="cyan" cap="Output after one time constant, from the analytical equation."><span>{(responseAt(1, 1) * 100).toFixed(1)}</span><small>%</small></Big></div>
        <Facts items={[
          { text: "Both curves use the same unit input, zero initial output, and identical axes." },
          { text: "Doubling the time constant stretches the time scale; it does not change the equilibrium." },
        ]} />
      </div>
    </div>
  </div>
}

function Conclusions() {
  return <div className="slide">
    <Head />
    <div className="split">
      <Rise className="stack">
        <h3>The time constant sets the response speed</h3>
        <Facts items={[
          { text: "A larger time constant produces a slower unit-step response in this model." },
          { text: "A finite observation window does not establish that the equilibrium has been reached." },
          { icon: "sliders", text: "This linear first-order example has no delay, saturation, noise, or coupled states." },
        ]} />
      </Rise>
      <Rise className="equation"><Tex block>{String.raw`\lim_{t\to\infty} y(t) = 1`}</Tex></Rise>
    </div>
  </div>
}

function Appendix() {
  return <div className="slide">
    <Head />
    <div className="split">
      <Rise className="panel pad stack appendix-equations">
        <h3>Declared analytical relationship</h3>
        <Tex block>{String.raw`\tau\dot y + y = u,\quad y(0)=0`}</Tex>
        <Tex block>{String.raw`u(t\ge 0)=1,\quad \tau>0`}</Tex>
        <Tex block>{String.raw`y(t)=1-e^{-t/\tau}`}</Tex>
      </Rise>
      <Facts items={[
        { text: "Times are in seconds; input and output are dimensionless." },
        { text: "Curves use the exact equation, sampled every 0.02 s over 4 s. No numerical integration is needed." },
        { text: "The model, assumptions, and evidence inventory are in src/model.js and DATA.md." },
        { text: "These are analytical teaching examples, not experimental or project-specific results." },
      ]} />
    </div>
  </div>
}

export const SLIDES = [
  { id: "title", C: Title, ch: "Introduction" },
  { id: "response", C: Response, ch: "01 · Model response" },
  { id: "comparison", C: Comparison, ch: "02 · Comparison" },
  { id: "conclusions", C: Conclusions, ch: "03 · Conclusions" },
  { id: "appendix", C: Appendix, ch: "Appendix" },
]
