document.addEventListener('DOMContentLoaded', function () {

    const searchButton = document.getElementById('search-button');
    const usernameInput = document.getElementById('username');
    const statsContainer = document.querySelector('.stats-container');

    const easyProgressCircle = document.querySelector('.easy-progress');
    const mediumProgressCircle = document.querySelector('.medium-progress');
    const hardProgressCircle = document.querySelector('.hard-progress');

    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');

    const statsCardContainer = document.querySelector('.stats-card');


    function validateUsername(username) {

        if (username.trim() === '') {
            alert('Please enter a username');
            return false;
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        const isValid = usernameRegex.test(username);

        if (!isValid) {
            alert('Invalid username. Please enter a valid username.');
            return false;
        }

        return isValid;
    }


    function updateProgress(solved, total, label, circle) {
        const progressPercent = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressPercent}%`);
        label.textContent = `${solved}/${total}`;
    }


    function displayStats(data) {
        const totalEasyQues = data.data.allQuestionsCount.find(
            item => item.difficulty === "Easy"
        ).count;
        const totalMediumQues = data.data.allQuestionsCount.find(
            item => item.difficulty === "Medium"
        ).count;
        const totalHardQues = data.data.allQuestionsCount.find(
            item => item.difficulty === "Hard"
        ).count;

        const submissions = data.data.matchedUser.submitStats.acSubmissionNum;

        let solvedEasyQues = 0;
        let solvedMediumQues = 0;
        let solvedHardQues = 0;

        submissions.forEach(function (item) {
            if (item.difficulty === "Easy") {
                solvedEasyQues = item.count;
            }
            if (item.difficulty === "Medium") {
                solvedMediumQues = item.count;
            }
            if (item.difficulty === "Hard") {
                solvedHardQues = item.count;
            }
        });

        console.log("Easy:", solvedEasyQues);
        console.log("Medium:", solvedMediumQues);
        console.log("Hard:", solvedHardQues);

        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgressCircle);

        statsContainer.classList.remove('hidden');
    }


    async function fetchUserStats(username) {

        try {

            searchButton.textContent = 'Searching...';
            searchButton.disabled = true;


            const proxyUrl = 'https://corsproxy.io/?url=';
            const targeturl = 'https://leetcode.com/graphql/';


            const myHeaders = new Headers();

            myHeaders.append('Content-Type', 'application/json');


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

                body: graphql,

                redirect: "follow"

            };


            const response = await fetch(
                proxyUrl + encodeURIComponent(targeturl),
                requestOptions
            );


            if (!response.ok) {
                throw new Error('Unable to fetch user stats.');
            }


            const data = await response.json();

            console.log("logging data:", data);


            if (data.errors) {
                throw new Error(data.errors[0].message);
            }


            const userData = data.data.matchedUser;


            if (!userData) {
                throw new Error('User not found.');
            }


            displayStats(data);


        } catch (error) {

            statsContainer.classList.remove('hidden');
            statsContainer.innerHTML =
                '<p style="color: #ff6b6b; text-align: center;">Error fetching user stats. Please try again later.</p>';

            console.error(
                'Error fetching user stats:',
                error
            );

        } finally {

            searchButton.textContent = 'Search';
            searchButton.disabled = false;

        }

    }


    searchButton.addEventListener('click', function () {

        const username = usernameInput.value;

        console.log(
            "logging username:",
            username
        );

        if (validateUsername(username)) {

            fetchUserStats(username);

        }

    });

});