import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import WinkBoxController from './componenets/WinkBoxController/WinkBoxController'
import './App.css';

const DEFAULT_SCROLL_BY_PIXELS = 120

const App = () => {
    // TODO: Drop down with choosing the action (window back/forward)
    const [scrollBy, setScrollBy] = useState(DEFAULT_SCROLL_BY_PIXELS);
    const currentYScrollPosition = useRef(0)

    useEffect(() => {
        listenToWindowScroll();
        return () => {
            window.removeEventListener('scroll', () => currentYScrollPosition.current = window.scrollY)
        };
    }, []);

    const listenToWindowScroll = () => {
        window.addEventListener('scroll', () => currentYScrollPosition.current = window.scrollY)
    }

    const scrollOnWinkAction = pixelsToScroll => {
        window.scroll({
            top: currentYScrollPosition.current + pixelsToScroll,
            behavior: 'smooth'
        });
    }

    return (
        <div className="App">
            <WinkBoxController
                onRightWinkAction={() => scrollOnWinkAction(DEFAULT_SCROLL_BY_PIXELS)}
                onLeftWinkAction={() => scrollOnWinkAction(-DEFAULT_SCROLL_BY_PIXELS)}
            />
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras auctor sodales tempus. Sed ante
                libero, scelerisque a pulvinar non, mattis eu nibh. Donec bibendum euismod lorem quis laoreet.
                Aenean elit leo, pretium vel condimentum quis, porta vel lorem. Suspendisse cursus ante sed
                purus
                hendrerit, in porta mauris vehicula. Duis quis egestas ipsum, quis porta neque. Curabitur
                vulputate
                felis ac ex iaculis facilisis. Fusce euismod, velit ut interdum vehicula, massa ligula vehicula
                mi,
                in ultricies ex nulla sit amet tellus. Suspendisse porttitor tellus velit, id vestibulum dolor
                pharetra at. Nullam tempor mi aliquam neque rhoncus feugiat. Suspendisse id cursus velit, ac
                cursus
                urna. Donec ut placerat lectus. Fusce sit amet malesuada turpis, et posuere est. In ut congue
                tortor, id aliquet sapien.
            </p>
            <p>

                Suspendisse dolor ante, finibus at euismod quis, porttitor et nulla. In erat eros, tempus a
                facilisis sed, faucibus consequat est. Mauris venenatis enim ut ante molestie, feugiat convallis
                libero eleifend. Praesent sodales, ligula tempus fringilla iaculis, elit ex posuere lorem, ut
                lacinia turpis ex et orci. Proin varius mauris quam, sit amet rutrum ante dictum sed. Sed non
                metus
                sed dolor suscipit tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac
                gravida sem. Suspendisse potenti.
            </p>
            <p>

                Sed sit amet nisl sit amet lectus interdum iaculis. Proin at dolor id lacus rutrum suscipit.
                Integer
                vehicula urna at enim viverra fermentum. Pellentesque nec consectetur ipsum, eget accumsan est.
                Donec turpis risus, posuere in euismod sed, maximus a felis. Nam aliquet sit amet tellus vitae
                suscipit. Nullam varius massa id ex sagittis, eget pellentesque neque rhoncus. Nunc a mollis
                erat,
                sit amet tincidunt dui. Pellentesque tincidunt lorem ac justo aliquet faucibus. In hendrerit
                ornare
                mauris, in vulputate ipsum.

            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
            <p>

                Etiam rhoncus congue magna, nec congue eros viverra quis. Vivamus ut erat erat. Donec hendrerit
                nunc
                fermentum turpis sollicitudin rhoncus. Fusce aliquet interdum hendrerit. Vivamus laoreet ligula
                at
                pretium aliquam. Praesent hendrerit lorem rutrum sem tempor semper. Integer lacinia felis nisi,
                sit
                amet hendrerit nunc suscipit in. Pellentesque molestie ultrices orci, interdum vehicula augue
                mollis
                quis. Nullam at sodales mauris.
            </p>
        </div>
    );
}

export default App;
