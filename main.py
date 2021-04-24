import eel
import random

eel.init("web")

@eel.expose
def start_game(city_name_input):
  # initialize game parameters
  global day
  global population
  global budget
  global total_spent
  global total_emissions
  global emissions_today
  global main_power
  global main_infra
  global grid
  grid_size = 9
  grid = [[-1 for _ in range(0, grid_size)] for _ in range(0, grid_size)]

  day = 0
  population = 500 * random.randint(850, 1150) # starting population of city
  budget = 5000 * random.randint(850, 1150) # money available at start
  total_spent = 0
  total_emissions = 0
  emissions_today = 0

  class Building:
      def __init__(self, output : int, emissions : int, cost : int, env_cost : int, power_type : str, amount: int, description : str, global_id : int):
        self.base_output = output
        self.base_emissions = emissions
        self.cost = cost
        self.env_cost = env_cost # upfront emissions required to build
        self.type = power_type
        self.amount = amount
        self.desc = description
        self.locations = []
        self.id = global_id
      
      def buy(self, x, y): # returns in the form (successfulness, new budget)
        global budget
        global total_emissions
        global emissions_today
        global grid
        if self.cost <= budget:
          self.amount += 1
          budget -= self.cost
          total_emissions += self.env_cost
          emissions_today += self.env_cost
          self.locations.append((x, y))
          grid[x][y] = self.id
          return (True, budget)
        else:
          return (False, budget)
      
      @property
      def output(self):
        return self.amount * self.base_output

      @property
      def emissions(self):
        return self.amount * self.base_emissions

  class Amenity(Building):
      pass

  class PowerGrid:
      def __init__(self):
          self.assets = [

            Building(600000, 600, 1500000, 60000, "Coal Power Plant", 0, "A typical coal-powered power plant.", 0),
            
            Building(800000, 400, 3000000, 60000, "Natural Gas Power Plant", 0, "A power plant powered by natural gas.", 1),

            Building(60000, 500, 2000000, 60000, "Oil Power Plant", 0, "A power plant powered by crude oil.", 2),

            Building(1000000, 1, 10000000, 100000, "Nuclear Power Plant", 0, "A power plant harnessing nuclear fission to create lots of power.", 3),

            Building(2500000, 0, 20000000, 500000, "Hydroelectric Dam", 0, "A dam that takes advantage of gravity and flowing water to generate significant electricity.", 4),

            Building(1200, 0, 1000, 1000, "Solar Farm", 0, "A field of solar panels, ready to receive the Sun's power.", 5),
            
            Building(1500, 0, 1000, 500, "Wind Farm", 0, "An expanse of wind turbines, prepared to catch the colours of the wind.", 6),
            ]
      
      @property
      def output(self):
          return sum([source.output for source in self.assets])
      
      @property
      def emissions(self):
          return sum([source.emissions for source in self.assets])
  
  class Infrastructure(PowerGrid):
      def __init__(self):
        self.assets = [
          Amenity(10000, 50, 100000, 2000, "Highway", grid_size, "A concrete and tarmac road to get around.", 10),

          Amenity(5000, 0, 20000, 500, "Bike Lane", 0, "A concrete and tarmac road to get around.", 11),

          Amenity(2000, 10, 10000, 500, "Bus Line", 0, "An electric bus that helps people get around.", 12),
          
          Amenity(20000, 10, 500000, 5000, "Apartment", grid_size, "A place for a lot of people to live.", 13),

          Amenity(10000, -20, 25000, 100, "Green Space", 0, "A serene natural park full of trees, plants, and life. Citizens love visiting, and it helps take nasty emissions out of the air.", 14)
          
        ]
  
  main_infra = Infrastructure()
  main_power = PowerGrid()
  
  budget += 100000*grid_size
  for x in range(0, grid_size):
      main_infra.assets[0].buy(grid_size//2, x)

  budget += 4000000
  for _ in range(0, grid_size):
      while True:
        target = (random.randint(0, grid_size-1), random.randint(0, grid_size-1))
        if grid[target[0]][target[1]] == -1:
            main_infra.assets[3].buy(target[0], target[1])
            break

  budget += 1500000
  while True:
      target = (random.randint(0, grid_size-1), random.randint(0, grid_size-1))
      if grid[target[0]][target[1]] == -1:
          break
  main_power.assets[0].buy(target[0], target[1])

  global city_name
  city_name = city_name_input
  
@eel.expose
def initialize_screen_size(width, height):
    global global_width
    global global_height
    global_width = width
    global_height = height

@eel.expose
def next_day(): 
    print('Next Day!')
    global total_emissions
    global emissions_today
    global day
    global population
    global budget
    total_emissions += main_power.emissions
    total_emissions += main_infra.emissions
    emissions_today += main_power.emissions
    emissions_today += main_infra.emissions
    if emissions_today <= 0:
        eel.end(day, budget, population, total_spent, total_emissions, True) # True for win
        return
    day += 1
    population += (main.infra.output/10)-round(emissions_today/5)
    if population <= 0:
        eel.end(day, budget, population, total_spent, total_emissions, False) # False for loss
        return
    budget += population+random.randint(-100000,100000)
    population_change = (population//random.randint(850, 1150))
    population += population_change
    carbon = emissions_today
    emissions_today = 0
    return [day, budget, population, population_change, carbon]

@eel.expose
def get_carbon():
    return main_power.emissions

@eel.expose
def get_output():
    return main_power.output

@eel.expose
def get_population():
    return population

@eel.expose
def get_day():
    return day

@eel.expose
def get_grid():
    return grid

@eel.expose
def get_tile(x : int, y : int): # return int
   return grid[x][y]

@eel.expose
def get_source(source : int): # power sources
    target = main_power.assets[int(source)]
    return [target.base_output, target.base_emissions, target.cost, target.env_cost, target.type, target.amount, target.desc, target.emissions, target.output]

@eel.expose
def get_amenity(amenity_id : int):
    target = main_infra.assets[int(amenity_id)-10]
    return [target.base_output, target.base_emissions, target.cost, target.env_cost, target.type, target.amount, target.desc, target.emissions, target.output]

eel.start('index.html')  # must be after all other @eel decorators
