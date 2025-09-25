import React, { useState, useEffect } from 'react'
import { Button, ButtonGroup } from 'reactstrap'
import config from 'src/config'

export const Taxonomy = (props) => {
  const url = config.APP.BASE_URI + '/projects/' + props.project.code + '/'
  const buttons = ['by Phylum', 'by Class', 'by Order', 'by Family', 'by Genus', 'by Species']
  const [selectedButton, setSelectedButton] = useState('by Phylum')

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
    </>
  )
}
