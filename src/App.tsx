import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { diceRoll } from './util';

interface AppState {
  potatoes: number,
  destiny: number,
  orcs: number,
  orcCost: number,
  running: boolean,
  events: Event[]
}

export default class App extends React.Component<{}, AppState> {
  engine: GameEngine = new GameEngine();

  constructor(props: {} | Readonly<{}>) {
    super(props)
    this.state = {
      potatoes: this.engine.potatoes,
      destiny: this.engine.destiny,
      orcs: this.engine.orcs,
      orcCost: this.engine.orcCost,
      running: this.engine.running,
      events: this.engine.events,
    };

    this.onPassTime = this.onPassTime.bind(this);
    this.onRemoveOrc = this.onRemoveOrc.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  refreshState(): void {
    this.setState(() => ({
      potatoes: this.engine.potatoes,
      destiny: this.engine.destiny,
      orcs: this.engine.orcs,
      orcCost: this.engine.orcCost,
      running: this.engine.running,
      events: this.engine.events,
    }));
  }

  onPassTime(): void {
    this.engine.generateEvent();
    this.refreshState();
    console.log(this.state.events);
  }

  onRemoveOrc(): void {
    this.engine.removeOrc();
    this.refreshState();
  }

  onReset(): void {
    this.engine.initialize();
    this.refreshState();
  }

  render(): React.ReactNode {
    return (
      <div className="App">
        <div className='App-body'>
          <h1>Potato Game</h1>
          <p>Destiny: {this.state.destiny}</p>
          <p>Potatoes: {this.state.potatoes}</p>
          <p>Orcs: {this.state.orcs}</p>
          <p>Potatoes to remove an orc: {this.state.orcCost}</p>
          <p>{this.state.events.at(this.state.events.length)?.text}</p>
          <div className="button-holder">
            <button className='pill' onClick={this.onPassTime} disabled={!this.state.running}>Pass Time</button>
            <button className='pill' onClick={this.onRemoveOrc} disabled={!this.state.running || this.state.potatoes < this.state.orcCost || this.state.orcs < 1}>Remove Orc</button>
            <button className='pill' onClick={this.onReset}>Reset</button>
          </div>
          <p><a href='https://twitter.com/deathbybadger/status/1567425842526945280' className='twitter-link' target='_blank' rel='noreferrer'>Rules by @deathbybadger on Twitter</a></p>
        </div>
        <EventList events={this.state.events}/>
      </div>
    );
  }
}

interface Event {
  heading?: string;
  text: string;
  destinyDifference?: number;
  potatoDifference?: number;
  orcDifference?: number;
}

const GardenEvents: Event[] = [
  {
    text: "You happily root about all day in your garden.",
    potatoDifference: 1,
  },
  {
    text: "You narrowly avoid a vistor by hiding in a potato sack.",
    destinyDifference: 1,
    potatoDifference: 1,
  },
  {
    text: "A hooded stranger lingers outside your farm.",
    destinyDifference: 1,
    orcDifference: 1,
  },
  {
    text: "Your field is ravaged in the night by unseen enemies.",
    potatoDifference: -1,
    orcDifference: 1,
  },
  {
    text: "You trade potatoes for other delicious foodstuffs.",
    potatoDifference: -1,
  },
  {
    text: "You burrow into a bumper crop of potatoes. Do you cry with joy? Possibly.",
    potatoDifference: 2,
  }
]

const DoorEvents: Event[] = [
  {
    text: "A distant cousin. They are after your potatoes. They may snitch on you.",
    orcDifference: 1,
  },
  {
    text: "A dwarven stranger. You refuse them entry. Ghastly creatures.",
    destinyDifference: 1,
  },
  {
    text: "A wizard strolls by. You pointedly draw the curtains.",
    destinyDifference: 1,
    orcDifference: 1,
  },
  {
    text: "There are rumours of war in the reaches. You eat some potatoes.",
    potatoDifference: -1,
    orcDifference: 2,
  },
  {
    text: "It's an elf. They are not serious people.",
    destinyDifference: 1,
  },
  {
    text: "It's a sack of potatoes from a generous neighbour. You really must remember to pay them a visit one of these years.",
    potatoDifference: 2,
  },
]

class GameEngine {
  destiny!: number;
  potatoes!: number;
  orcs!: number;
  orcCost!: number;
  events!: Event[];
  running!: boolean;

  constructor() {
    this.initialize();
  }

  initialize(): void {
    this.destiny = 0;
    this.potatoes = 0;
    this.orcs = 0;
    this.orcCost = 1;
    this.events = [];
    this.running = true;
  }

  generateEvent() {
    console.log("Generating event");

    const eventType = diceRoll(6);
    const eventIndex = diceRoll(6);

    let event: Event;

    if (eventType < 3) {
      event = GardenEvents[eventIndex];
      event.heading = "In The Garden…";
    } else if (eventType < 5) {
      event = DoorEvents[eventIndex];
      event.heading = "A Knock At The Door…";
    } else {
      event = {
        text: "The world becomes a darker, more dangerous place. From now on, removing ORC costs an additional POTATO.",
        heading: "Dark Clouds Linger…",
      }
      this.orcCost++;
    }

    this.events.push(event);
    this.processScores(event);
  }

  processScores(event: Event) {
    if (event.orcDifference) {
      this.orcs += event.orcDifference;
      if (this.orcs < 0) this.orcs = 0;
    }

    if (event.destinyDifference) {
      this.destiny += event.destinyDifference;
      if (this.destiny < 0) this.destiny = 0;
    }

    if (event.potatoDifference) {
      this.potatoes += event.potatoDifference;
      if (this.potatoes < 0) this.potatoes = 0;
    }

    // TODO: End game
    let endGameEvent: Event | null = null;
    if (this.orcs >= 10) {
      endGameEvent = {
        text: "The orcs have finally found your potato farm. Alas, orcs are not as interested in your potatoes as they are in eating you, and you have ended up in a cookpot."
      }
    } else if (this.destiny >= 10) {
      endGameEvent = {
        text: "An interfering wizard has turned up at your doorstep with a quest. You are whisked away against your will on an adventure."
      }
    } else if (this.potatoes >= 10) {
      endGameEvent = {
        text: "You have enough potatoes that you can go underground and not return to the surface until the danger has past. You nestle down into your burrow and enjoy your well-earned rest."
      }
    }

    if (endGameEvent) {
      endGameEvent.heading = "Game Over";
      this.events.push(endGameEvent);
      this.running = false;
    }
  }

  removeOrc(): void {
    this.orcs -= 1;
    this.potatoes -= this.orcCost;
  }
}

interface EventListProps {
  events: Event[]
}

class EventList extends React.Component<EventListProps> {
  render(): React.ReactNode {
    return (
      <div className='EventList'>
      {this.props.events.reverse().map((event: Event, index: number) => (
        <div className='Event'>
          {event.heading ? <p className='heading'>{event.heading}</p> : null}
          <p className={index === 0 ? 'latest' : ''}>{event.text}</p>
          {event.destinyDifference ? <p className='statUpdate'>DESTINY: {event.destinyDifference}</p> : null }
          {event.potatoDifference ? <p className='statUpdate'>POTATOES: {event.potatoDifference}</p> : null }
          {event.orcDifference ? <p className='statUpdate'>ORCS: {event.orcDifference}</p> : null }
        </div>
      ))}
      </div>
    )
  }
}