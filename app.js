const newsContainer = document.getElementById('news-container');
const loadingElement = document.getElementById('loading');
const refreshBtn = document.getElementById('refresh-btn');
const searchBar = document.getElementById('search-bar');

// Global array to hold the fetched articles
let allFetchedStories = [];

async function fetchTechNews() {
    loadingElement.style.display = 'block';
    newsContainer.innerHTML = '';
    searchBar.value = ''; // Clear search bar on refresh

    try {
        const response = await fetch('https://firebaseio.com');
        const storyIds = await response.json();
        const topTenIds = storyIds.slice(0, 10);

        const storyPromises = topTenIds.map(id => 
            fetch(`https://firebaseio.com{id}.json`).then(res => res.json())
        );
        
        // Save the raw stories array globally
        allFetchedStories = await storyPromises;
        loadingElement.style.display = 'none';

        // Display all of them initially
        displayStories(allFetchedStories);

    } catch (error) {
        loadingElement.innerText = 'Failed to load news. Please try again.';
        console.error('Error fetching news:', error);
    }
}

// Separate function purely tasked with rendering HTML cards
function displayStories(storiesToRender) {
    newsContainer.innerHTML = ''; // Clear container before rendering

    // Filter out empty items or stories missing links
    const validStories = storiesToRender.filter(story => story && story.url);

    if (validStories.length === 0) {
        newsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">No matching articles found.</p>';
        return;
    }

    validStories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <h3>${story.title}</h3>
            <div>
                <a href="${story.url}" target="_blank">Read Article →</a>
                <div class="meta">Score: ${story.score} points | By: ${story.by}</div>
            </div>
        `;
        newsContainer.appendChild(card);
    });
}

// Filter logic: Runs every time the user types a single character
searchBar.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Create a filtered list based on matching titles
    const filteredStories = allFetchedStories.filter(story => {
        if (!story || !story.title) return false;
        return story.title.toLowerCase().includes(searchTerm);
    });

    // Re-render the grid with only the matching items
    displayStories(filteredStories);
});

// Event Listeners
fetchTechNews();
refreshBtn.addEventListener('click', fetchTechNews);
