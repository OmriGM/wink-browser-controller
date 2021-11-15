import { useState, useEffect } from 'react'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import './App.css';

const EYE_ASPECT_RATIO_TH = 0.35
const EYE_AR_CONSEC_FRAMES = 3

const App = () => {
    const [model, setModel] = useState(null);

    const calculateEyeAspectRatio = (upperEye, lowerEye) => {
        const a = calculateDistance(upperEye[4], lowerEye[3]);
        const b = calculateDistance(upperEye[5], lowerEye[4]);

        const c = calculateDistance(upperEye[0], upperEye[upperEye.length - 1]);
        const ear = (a + b) / (2.0 * c);
        return ear
    }

    const calculateDistance = (point1, point2) => Math.hypot(point2[0] - point1[0], point2[1] - point1[1])

    useEffect(async () => {
        const model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
        console.log('model loaded');
        const predictions = await model.estimateFaces({
            input: document.querySelector('img')
        });
        predictions.forEach(({ annotations }) => {
            const { leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0 } = annotations
            console.log(annotations);
            const leftEyeAspectRatio = calculateEyeAspectRatio(leftEyeUpper0, leftEyeLower0)
            const rightEyeAspectRatio = calculateEyeAspectRatio(rightEyeLower0, rightEyeUpper0)
            if(rightEyeAspectRatio <= EYE_ASPECT_RATIO_TH) {
                window.scrollTo({
                    top: 200,
                    behavior: 'smooth'
                });
                console.log('right eye wink!')
            }
            if(leftEyeAspectRatio <= EYE_ASPECT_RATIO_TH) console.log('left eye wink!')
            console.log(leftEyeAspectRatio);
            console.log(rightEyeAspectRatio);
        })
        // for each face
        // calculate the eye aspect ratio for each eye
        // if it's less than TH, it's a blink
        // check if it's a wink (and determine which eye to make sure it's a wink and not a blink by using the EAR
        // value which should be bigger than the TH
        // Interact with the browser upon a wink by the user choice (Can be go back/forward or scrolling down/up in
        // the same page, or get more ideas)
        // Optional:
        // let the user enable video frame presented at the top left
        // create a chrome extension from it
        // Add a counter for: blinks, right wink, left wink
        // Add animations
        // Present a winking emoji matching the wink side on the face
    }, [])

    return (
        <div className="App">
            <img crossOrigin='anonymous'
                 src={'https://qph.fs.quoracdn.net/main-qimg-5cc7395de4daa5267f0de0ec1e9571dc-c'}
                 alt="logo"/>
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
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
        </div>
    );
}

export default App;
