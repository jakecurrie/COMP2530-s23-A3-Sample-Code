const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let selectedTypes = []

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(numPages, currentPage + 2);
  
  if(currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 prevPage" value="${currentPage - 1}">Previous</button>
    `)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">${i}</button>
    `)
  }

  if(currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 nextPage" value="${currentPage + 1}">Next</button>
    `)
  }
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  const filteredPokemons = await filterPokemons(pokemons, selectedTypes);
  const selected_pokemons = filteredPokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}

const filterPokemons = async (pokemons, selectedTypes) => {
  if (selectedTypes.length === 0) {
    return pokemons;
  }

  let filteredPokemons = [];
  for (let pokemon of pokemons) {
    const res = await axios.get(pokemon.url);
    if (res.data.types.some(type => selectedTypes.includes(type.type.name))) {
      filteredPokemons.push(pokemon);
    }
  }

  return filteredPokemons;
}

const setup = async () => {
  // Fetch all pokemons
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  // Fetch pokemon types and render checkboxes
  const typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
  types = typesResponse.data.results.map(type => type.name);
  types.forEach(type => {
    $('#pokeTypes').append(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${type}" id="${type}">
        <label class="form-check-label" for="${type}">
          ${type}
        </label>
      </div>
    `);
  });

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  // add event listener to type checkboxes
  $('body').on('change', '.form-check-input', function () {
    selectedTypes = [];
    $('.form-check-input:checked').each(function() {
      selectedTypes.push($(this).val());
    });
    paginate(currentPage, PAGE_SIZE, pokemons);
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages)
  });

  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    const types = res.data.types.map((type) => type.type.name)
    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h3>Stats</h3>
          <ul>
            ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
        </div>
      </div>
      <h3>Types</h3>
      <ul>
        ${types.map((type) => `<li>${type}</li>`).join('')}
      </ul>
    `);
    $('.modal-title').html(`
      <h2>${res.data.name.toUpperCase()}</h2>
      <h5>${res.data.id}</h5>
    `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages)
  })

  $('body').on('click', ".prevPage", function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages)
  })

  $('body').on('click', ".nextPage", function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages)
  })
}

$(document).ready(setup)
