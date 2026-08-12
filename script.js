document.addEventListener('DOMContentLoaded', function () {

    const searchButton = document.getElementById('search-button');
    const usernameInput = document.getElementById('username');
    const statsContainer = document.querySelector('.stats-container');
   const cardStatsContainer = document.getElementById('stats-card');

    const easyProgressCircle = document.querySelector('.easy-progress');
    const mediumProgressCircle = document.querySelector('.medium-progress');
    const hardProgressCircle = document.querySelector('.hard-progress');

    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');


    // Validate username
    function validateUsername(username) {

        if (username.trim() === '') {
            alert('Please enter a username');
            return false;
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!usernameRegex.test(username)) {
            alert('Invalid username. Please enter a valid username.');
            return false;
        }

        return true;
    }


    // Update progress circles
    function updateProgress(solved, total, label, circle) {

        const progressDegree = (solved / total) * 360;

        circle.style.setProperty(
            '--progress-degree',
            `${progressDegree}deg`
        );

        label.textContent = `${solved}/${total}`;
    }


    // Display stats on UI
    function displayStats(data) {

    const allQuestions = data.data.allQuestionsCount;

    const submitStats = data.data.matchedUser.submitStats;

    const submissions = submitStats.acSubmissionNum;

    const totalSubmissions = submitStats.totalSubmissionNum;


    // Total questions
    const totalEasy = allQuestions.find(
        item => item.difficulty === 'Easy'
    ).count;

    const totalMedium = allQuestions.find(
        item => item.difficulty === 'Medium'
    ).count;

    const totalHard = allQuestions.find(
        item => item.difficulty === 'Hard'
    ).count;


    // Solved questions
    const solvedEasy = submissions.find(
        item => item.difficulty === 'Easy'
    ).count;

    const solvedMedium = submissions.find(
        item => item.difficulty === 'Medium'
    ).count;

    const solvedHard = submissions.find(
        item => item.difficulty === 'Hard'
    ).count;


    console.log('Easy:', solvedEasy, '/', totalEasy);
    console.log('Medium:', solvedMedium, '/', totalMedium);
    console.log('Hard:', solvedHard, '/', totalHard);


    // Update progress circles
    updateProgress(
        solvedEasy,
        totalEasy,
        easyLabel,
        easyProgressCircle
    );

    updateProgress(
        solvedMedium,
        totalMedium,
        mediumLabel,
        mediumProgressCircle
    );

    updateProgress(
        solvedHard,
        totalHard,
        hardLabel,
        hardProgressCircle
    );


    // Submission data
    const overall = totalSubmissions.find(
        item => item.difficulty === 'All'
    );

    const easy = totalSubmissions.find(
        item => item.difficulty === 'Easy'
    );

    const medium = totalSubmissions.find(
        item => item.difficulty === 'Medium'
    );

    const hard = totalSubmissions.find(
        item => item.difficulty === 'Hard'
    );


    const cardData = [
        {
            label: 'Overall Submissions',
            value: overall ? overall.submissions : 0
        },
        {
            label: 'Easy Submissions',
            value: easy ? easy.submissions : 0
        },
        {
            label: 'Medium Submissions',
            value: medium ? medium.submissions : 0
        },
        {
            label: 'Hard Submissions',
            value: hard ? hard.submissions : 0
        }
    ];


    console.log('Card Data:', cardData);


    // Check card container
    if (!cardStatsContainer) {
        throw new Error('stats-card element was not found in HTML.');
    }


    // Create cards
    cardStatsContainer.innerHTML = '';


    cardData.forEach(function (item) {

        const card = document.createElement('div');

        card.classList.add('card');

        card.innerHTML = `
            <h3>${item.label}</h3>
            <p>${item.value}</p>
        `;

        cardStatsContainer.appendChild(card);

    });


    // Show stats
    statsContainer.classList.remove('hidden');

}

    // Fetch LeetCode data
    async function fetchUserStats(username) {

        try {

            searchButton.textContent = 'Searching...';
            searchButton.disabled = true;


            const proxyUrl = 'https://corsproxy.io/?url=';
            const targetUrl = 'https://leetcode.com/graphql/';


            const myHeaders = new Headers();

            myHeaders.append(
                'Content-Type',
                'application/json'
            );


            const graphql = JSON.stringify({

                query: `
                    query userSessionProgress($username: String!) {

                        allQuestionsCount {
                            difficulty
                            count
                        }

                        matchedUser(username: $username) {

                            submitStats {

                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }

                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }

                            }

                        }

                    }
                `,

                variables: {
                    username: username
                }

            });


            const requestOptions = {

                method: 'POST',

                headers: myHeaders,

                body: graphql

            };


            const response = await fetch(
                proxyUrl + encodeURIComponent(targetUrl),
                requestOptions
            );


            if (!response.ok) {
                throw new Error('Unable to fetch user stats.');
            }


            const data = await response.json();


            console.log('API Response:', data);


            // Check API errors
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }


            // Check if user exists
            if (!data.data || !data.data.matchedUser) {
                throw new Error('User not found.');
            }


            // Display stats
            displayStats(data);


        } catch (error) {

    console.error('ACTUAL ERROR:', error);
    console.error('ERROR MESSAGE:', error.message);

    alert('Error: ' + error.message);

} finally {

            searchButton.textContent = 'Search';
            searchButton.disabled = false;

        }
    }


    // Search button
    searchButton.addEventListener('click', function () {

        const username = usernameInput.value.trim();

        console.log('Username:', username);


        if (validateUsername(username)) {

            fetchUserStats(username);

        }

    });


    // Search using Enter
    usernameInput.addEventListener('keydown', function (event) {

        if (event.key === 'Enter') {

            searchButton.click();

        }

    });

});