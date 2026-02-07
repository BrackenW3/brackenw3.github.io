import streamlit as st
import pandas as pd
import numpy as np

st.title('Example Streamlit App')

st.write("This is a simple Streamlit app running on Streamlit Cloud.")

if st.button('Generate Random Data'):
    data = pd.DataFrame(
        np.random.randn(20, 3),
        columns=['a', 'b', 'c']
    )
    st.line_chart(data)
