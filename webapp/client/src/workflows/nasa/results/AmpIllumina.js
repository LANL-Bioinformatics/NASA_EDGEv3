import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'

import { JsonTable } from 'src/edge/common/Tables'
import { Header } from 'src/edge/project/results/CardHeader'
import config from 'src/config'
import { AlphaDiversity } from './AlphaDiversity'
import { BetaDiversity } from './BetaDiversity'
import { Taxonomy } from './Taxonomy'
import { DifferentialAbundance } from './DifferentialAbundance'

export const AmpIllumina = (props) => {
  const [collapseCard, setCollapseCard] = useState(true)
  const url = config.APP.BASE_URI + '/projects/' + props.project.code + '/'
  const tabs = {
    'Alpha Diversity': 'alpha_diversity',
    'Beta Diversity': 'beta_diversity',
    Taxonomy: 'taxonomy',
    'Differential Abundance': 'differential_abundance',
  }
  const [activeTab, setActiveTab] = useState(0)

  const toggleTab = (tab) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    if (props.allExpand > 0) {
      setCollapseCard(false)
    }
  }, [props.allExpand])

  useEffect(() => {
    if (props.allClosed > 0) {
      setCollapseCard(true)
    }
  }, [props.allClosed])

  return (
    <Card className="workflow-result-card">
      <Header
        toggle={true}
        toggleParms={() => {
          setCollapseCard(!collapseCard)
        }}
        title={'AmpIllumina Result'}
        collapseParms={collapseCard}
      />
      <Collapse isOpen={!collapseCard}>
        <CardBody>
          <Nav tabs>
            {Object.keys(tabs).map((tool, index) => (
              <NavItem key={tool + index}>
                <NavLink
                  style={{ cursor: 'pointer' }}
                  active={activeTab === index}
                  onClick={() => {
                    toggleTab(index)
                  }}
                >
                  {tool}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <TabContent activeTab={activeTab}>
            {Object.keys(tabs).map((tool, index) => (
              <TabPane key={index} tabId={index}>
                <br></br>
                {tool === 'Alpha Diversity' ? (
                  <AlphaDiversity project={props.project} result={props.result[tabs[tool]]} />
                ) : tool === 'Beta Diversity' ? (
                  <BetaDiversity project={props.project} result={props.result[tabs[tool]]} />
                ) : tool === 'Taxonomy' ? (
                  <Taxonomy project={props.project} result={props.result[tabs[tool]]} />
                ) : tool === 'Differential Abundance' ? (
                  <DifferentialAbundance
                    project={props.project}
                    result={props.result[tabs[tool]]}
                  />
                ) : (
                  <span>
                    No plots available
                    <br></br>
                    <br></br>
                  </span>
                )}
              </TabPane>
            ))}
          </TabContent>
          <br></br>
          <br></br>
          <h4>Read Count Tracking</h4>
          <br></br>
          {props.result['Read Count Tracking'] ? (
            <JsonTable
              data={props.result['Read Count Tracking']}
              headers={Object.keys(props.result['Read Count Tracking'][0])}
            />
          ) : (
            <span>
              Empty table
              <br></br>
              <br></br>
            </span>
          )}
          <br></br>
          <h4>Taxonomy and Counts</h4>
          <br></br>
          {props.result['Taxonomy and Counts'] ? (
            <JsonTable
              data={props.result['Taxonomy and Counts']}
              headers={Object.keys(props.result['Taxonomy and Counts'][0])}
            />
          ) : (
            <span>
              Empty table
              <br></br>
              <br></br>
            </span>
          )}
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
