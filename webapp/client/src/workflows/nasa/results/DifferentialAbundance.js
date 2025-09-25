import React, { useState, useEffect } from 'react'
import { Button, ButtonGroup } from 'reactstrap'

import { JsonTable } from 'src/edge/common/Tables'
import config from 'src/config'

export const DifferentialAbundance = (props) => {
  const url = config.APP.BASE_URI + '/projects/' + props.project.code + '/'
  const buttons = ['ANCOMBC1', 'ANCOMBC2', 'DESeq2']
  const [selectedButton, setSelectedButton] = useState('ANCOMBC1')
  const [table1Open, setTable1Open] = useState(false)
  const [table2Open, setTable2Open] = useState(false)
  const [table3Open, setTable3Open] = useState(false)

  return (
    <>
      <br></br>
      <ButtonGroup className="mr-3" aria-label="First group" size="sm">
        {buttons.map((item, index) => (
          <Button
            key={`taxonomy-${index}`}
            color="outline-primary"
            onClick={() => {
              setSelectedButton(item)
            }}
            active={selectedButton === item}
          >
            {item}
          </Button>
        ))}
      </ButtonGroup>
      <br></br>
      <br></br>
      {props.result[selectedButton] ? (
        props.result[selectedButton]['plots'].map((html, id) => (
          <span key={id} title="Click to view the image in full screen">
            <a href={url + html} target="_blank" rel="noreferrer">
              <img src={url + html} alt={html} width="50%" height="50%"></img>
            </a>
          </span>
        ))
      ) : (
        <span>
          No plots available
          <br></br>
          <br></br>
        </span>
      )}
      <br></br>
      <br></br>
      <span className="edge-link-large" onClick={() => setTable1Open(!table1Open)}>
        Sample Info
      </span>
      {table1Open && (
        <>
          {props.result[selectedButton]['Sample Info'] ? (
            <JsonTable
              data={props.result[selectedButton]['Sample Info']}
              headers={Object.keys(props.result[selectedButton]['Sample Info'][0])}
            />
          ) : (
            <span>
              <br></br>
              Empty table
            </span>
          )}
        </>
      )}
      <br></br>
      <span className="edge-link-large" onClick={() => setTable2Open(!table2Open)}>
        Pairwise Contrasts
      </span>
      {table2Open && (
        <>
          {props.result[selectedButton]['Pairwise Contrasts'] ? (
            <JsonTable
              data={props.result[selectedButton]['Pairwise Contrasts']}
              headers={Object.keys(props.result[selectedButton]['Pairwise Contrasts'][0])}
            />
          ) : (
            <span>
              <br></br>
              Empty table
            </span>
          )}
        </>
      )}
      <br></br>
      <span className="edge-link-large" onClick={() => setTable3Open(!table3Open)}>
        Differential Abundance
      </span>
      {table3Open && (
        <>
          {props.result[selectedButton]['Differential Abundance'] ? (
            <JsonTable
              data={props.result[selectedButton]['Differential Abundance']}
              headers={Object.keys(props.result[selectedButton]['Differential Abundance'][0])}
            />
          ) : (
            <span>
              <br></br>
              Empty table
            </span>
          )}
        </>
      )}
      <br></br>
    </>
  )
}
