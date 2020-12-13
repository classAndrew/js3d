# with an actual 3d plotter
import matplotlib.pyplot as plt 
from matplotlib.pyplot import plot, draw, show
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter([])
draw()
print('continue computation')

# at the end call show to ensure window won't close.
show()
